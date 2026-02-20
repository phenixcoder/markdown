import { contextBridge, ipcRenderer, IpcRendererEvent, webUtils } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('open-file'),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  setWindowTitle: (title: string) => ipcRenderer.send('set-window-title', title),
  setWindowHasContent: (hasContent: boolean) =>
    ipcRenderer.send('set-window-has-content', hasContent),
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  getPathForFile: (file: File) => webUtils.getPathForFile(file),
  getRecentFiles: () => ipcRenderer.invoke('get-recent-files'),
  clearRecentFiles: () => ipcRenderer.invoke('clear-recent-files'),
  removeRecentFile: (filePath: string) => ipcRenderer.invoke('remove-recent-file', filePath),
  on: (channel: string, callback: (event: IpcRendererEvent, ...args: unknown[]) => void) => {
    ipcRenderer.on(channel, callback)
  },
  off: (channel: string, callback: (event: IpcRendererEvent, ...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, callback)
  },
})
