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
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  window.setAlwaysOnTop(true, 'floating')
  window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  // Dismiss like a menu-bar dropdown: close as soon as it loses focus — unless the SmartThings
  // login window just stole focus, in which case we want the popover to stay put underneath it.
  window.on('blur', () => {
    if (isLoginWindowOpen()) return
    window.hide()
  })

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

  const sendRefresh = (): void => {
    window.webContents.send(REFRESH_CHANNEL)
  }

  const showWindow = (): void => {
    positionUnderTray(window, tray)
    window.show()
    window.focus()
    sendRefresh()
  }

  const toggleWindow = (): void => {
    if (window.isVisible()) {
      window.hide()
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
