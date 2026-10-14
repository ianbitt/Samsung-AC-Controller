import { app, ipcMain } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createTrayApp } from './tray'
import {
  ac,
  isAcMode,
  isAcFanMode,
  isFanOscillationMode,
  isAcOptionalMode,
  isAutoCleaningMode
} from './devices/ac'

const MIN_TEMP = 16
const MAX_TEMP = 30

function registerIpc(): void {
  ipcMain.handle('ac:getStatus', () => ac.getStatus())
  ipcMain.handle('ac:on', () => ac.on())
  ipcMain.handle('ac:off', () => ac.off())
  ipcMain.handle('ac:setTemperature', (_event, temp: number) => {
    if (typeof temp !== 'number' || temp < MIN_TEMP || temp > MAX_TEMP) {
      throw new Error(`Temperature must be between ${MIN_TEMP} and ${MAX_TEMP}`)
    }
    return ac.setTemperature(temp)
  })
  ipcMain.handle('ac:setMode', (_event, mode: unknown) => {
    if (!isAcMode(mode)) {
      throw new Error(`Invalid AC mode: ${String(mode)}`)
    }
    return ac.setMode(mode)
  })
  ipcMain.handle('ac:setFanMode', (_event, mode: unknown) => {
    if (!isAcFanMode(mode)) {
      throw new Error(`Invalid AC fan mode: ${String(mode)}`)
    }
    return ac.setFanMode(mode)
  })
  ipcMain.handle('ac:setSwingMode', (_event, mode: unknown) => {
    if (!isFanOscillationMode(mode)) {
      throw new Error(`Invalid AC swing mode: ${String(mode)}`)
    }
    return ac.setSwingMode(mode)
  })
  ipcMain.handle('ac:setOptionalMode', (_event, mode: unknown) => {
    if (!isAcOptionalMode(mode)) {
      throw new Error(`Invalid AC optional mode: ${String(mode)}`)
    }
    return ac.setOptionalMode(mode)
  })
  ipcMain.handle('ac:setAutoCleaningMode', (_event, mode: unknown) => {
    if (!isAutoCleaningMode(mode)) {
      throw new Error(`Invalid AC auto-cleaning mode: ${String(mode)}`)
    }
    return ac.setAutoCleaningMode(mode)
  })
  ipcMain.handle('ac:setDisplayLight', (_event, on: unknown) => {
    if (typeof on !== 'boolean') {
      throw new Error(`Display light must be a boolean, got: ${String(on)}`)
    }
    return ac.setDisplayLight(on)
  })
}

// Keep a single menu-bar icon even if the app gets launched twice; the second launch just
// re-shows the existing popover instead of spawning a duplicate tray entry.
const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {
  app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.ian.ac-controller')

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    registerIpc()

    const { showWindow } = createTrayApp()
    app.on('second-instance', () => showWindow())
  })
}

// This is a tray-only app: no dock icon, no normal windows to track, so there's
// nothing to quit on window-all-closed — the app lives in the menu bar until the
// user picks Quit from the tray's context menu.
