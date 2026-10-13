import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type {
  AcFanMode,
  AcMode,
  AcOptionalMode,
  AcStatus,
  AutoCleaningMode,
  FanOscillationMode
} from '../main/devices/ac'

// Custom APIs for renderer
const api = {
  ac: {
    getStatus: (): Promise<AcStatus> => ipcRenderer.invoke('ac:getStatus'),
    on: (): Promise<void> => ipcRenderer.invoke('ac:on'),
    off: (): Promise<void> => ipcRenderer.invoke('ac:off'),
    setTemperature: (temp: number): Promise<void> => ipcRenderer.invoke('ac:setTemperature', temp),
    setMode: (mode: AcMode): Promise<void> => ipcRenderer.invoke('ac:setMode', mode),
    setFanMode: (mode: AcFanMode): Promise<void> => ipcRenderer.invoke('ac:setFanMode', mode),
    setSwingMode: (mode: FanOscillationMode): Promise<void> =>
      ipcRenderer.invoke('ac:setSwingMode', mode),
    setOptionalMode: (mode: AcOptionalMode): Promise<void> =>
      ipcRenderer.invoke('ac:setOptionalMode', mode),
    setAutoCleaningMode: (mode: AutoCleaningMode): Promise<void> =>
      ipcRenderer.invoke('ac:setAutoCleaningMode', mode)
  },
  tray: {
    // Fired when the popover opens (or "Refresh status" is picked from the tray menu). Returns
    // an unsubscribe function so a component can clean up on unmount.
    onRefresh: (callback: () => void): (() => void) => {
      const listener = (): void => callback()
      ipcRenderer.on('tray:refresh', listener)
      return () => ipcRenderer.removeListener('tray:refresh', listener)
    }
  }
}

export type Api = typeof api

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
