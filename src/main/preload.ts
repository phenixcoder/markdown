import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('open-file'),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  setWindowTitle: (title: string) => ipcRenderer.send('set-window-title', title),
  setWindowHasContent: (hasContent: boolean) =>
    ipcRenderer.send('set-window-has-content', hasContent),
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  on: (channel: string, callback: (event: IpcRendererEvent, ...args: unknown[]) => void) => {
    ipcRenderer.on(channel, callback)
  },
  off: (channel: string, callback: (event: IpcRendererEvent, ...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, callback)
  },
})
