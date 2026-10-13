import {
  app,
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  Tray,
  globalShortcut,
  nativeImage,
  screen
} from 'electron'
import { join } from 'path'
import { readFileSync } from 'node:fs'
import { is } from '@electron-toolkit/utils'
import { isLoginWindowOpen } from './auth'
import trayIcon1x from '../../resources/iconTemplate.png?asset'
import trayIcon2x from '../../resources/iconTemplate@2x.png?asset'

const WINDOW_WIDTH = 340
const WINDOW_HEIGHT = 480
const REFRESH_CHANNEL = 'tray:refresh'
const TOGGLE_SHORTCUT = 'Alt+Cmd+A'
// Measured gap between a tray click and the 'blur' it triggers (whichever fires second) was
// consistently 15-37ms across two logged test rounds. This is a safety-net cleanup window for
// the state flags below, not the mechanism that makes them correct — see their comments.
const FLAG_SAFETY_RESET_MS = 500

function loadTrayIcon(): Electron.NativeImage {
  const image = nativeImage.createEmpty()
  image.addRepresentation({ scaleFactor: 1, buffer: readFileSync(trayIcon1x) })
  image.addRepresentation({ scaleFactor: 2, buffer: readFileSync(trayIcon2x) })
  image.setTemplateImage(true)
  return image
}

function createPopoverWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    fullscreenable: false,
    skipTaskbar: true,
    // macOS-only: a non-activating NSPanel. It can become key (so it still receives keyboard/
    // mouse input) without making our app the frontmost/active application — which is what lets
    // the previously-focused app (e.g. Terminal) stay visually active while this is open.
    type: 'panel',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  window.setAlwaysOnTop(true, 'floating')
  window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return window
}

function positionUnderTray(window: BrowserWindow, tray: Tray): void {
  const trayBounds = tray.getBounds()
  const windowBounds = window.getBounds()
  let x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2)
  let y = Math.round(trayBounds.y + trayBounds.height + 4)

  const { workArea } = screen.getDisplayNearestPoint({ x: trayBounds.x, y: trayBounds.y })
  x = Math.min(Math.max(x, workArea.x), workArea.x + workArea.width - windowBounds.width)
  y = Math.min(Math.max(y, workArea.y), workArea.y + workArea.height - windowBounds.height)

  window.setPosition(x, y, false)
}

function registerShortcuts(toggleWindow: () => void): void {
  if (!globalShortcut.register(TOGGLE_SHORTCUT, toggleWindow)) {
    console.warn(`Failed to register global shortcut: ${TOGGLE_SHORTCUT}`)
  }
  app.on('will-quit', () => globalShortcut.unregisterAll())
}

export function createTrayApp(): { showWindow: () => void } {
  app.dock?.hide()
  Menu.setApplicationMenu(null)

  const window = createPopoverWindow()
  const tray = new Tray(loadTrayIcon())
  tray.setToolTip('AC Controller')

  // Two races are possible around the same click (confirmed by logged timestamps across two
  // separate test rounds — order flips depending on window type/state, so both must be handled):
  //  (a) blur fires FIRST, ~30ms before the tray click that was meant to close the popover —
  //      without help, the click then sees an already-hidden window and reopens it.
  //  (b) the click fires first and closes the popover directly (the `isVisible()` branch in
  //      toggleWindow below); the resulting blur arrives ~15-27ms AFTER, as pure fallout from
  //      our own `window.hide()` call. Left unhandled, that fallout blur looks identical to case
  //      (a) and wrongly swallows the *next* click (the one meant to reopen).
  // `weCalledHide` tells the blur handler which case it's in: true means "this blur is fallout
  // from our own hide()," so it should be consumed silently rather than queued as a suppression.
  let suppressNextClick = false
  let suppressResetTimer: ReturnType<typeof setTimeout> | null = null
  let weCalledHide = false

  const armSuppression = (): void => {
    suppressNextClick = true
    if (suppressResetTimer) clearTimeout(suppressResetTimer)
    suppressResetTimer = setTimeout(() => {
      suppressNextClick = false
    }, FLAG_SAFETY_RESET_MS)
  }

  const hideWindow = (): void => {
    weCalledHide = true
    window.hide()
  }

  window.on('blur', () => {
    if (isLoginWindowOpen()) return
    if (weCalledHide) {
      weCalledHide = false
      return
    }
    armSuppression()
    window.hide()
  })

  const sendRefresh = (): void => {
    window.webContents.send(REFRESH_CHANNEL)
  }

  const showWindow = (): void => {
    positionUnderTray(window, tray)
    window.show()
    sendRefresh()
  }

  const toggleWindow = (): void => {
    if (suppressNextClick) {
      suppressNextClick = false
      if (suppressResetTimer) clearTimeout(suppressResetTimer)
      return
    }
    if (window.isVisible()) {
      hideWindow()
      return
    }
    showWindow()
  }

  const buildContextMenu = (): Menu => {
    const { openAtLogin } = app.getLoginItemSettings()
    const template: MenuItemConstructorOptions[] = [
      { label: 'Refresh status', click: sendRefresh },
      {
        label: 'Open at Login',
        type: 'checkbox',
        checked: openAtLogin,
        click: (item) => app.setLoginItemSettings({ openAtLogin: item.checked })
      },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() }
    ]
    return Menu.buildFromTemplate(template)
  }

  tray.on('click', toggleWindow)
  tray.on('right-click', () => tray.popUpContextMenu(buildContextMenu()))

  registerShortcuts(toggleWindow)

  return { showWindow }
}
