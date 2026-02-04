import { IpcRendererEvent } from 'electron'

export interface IElectronAPI {
  openFile: () => Promise<{ filePath: string; content: string } | null>
  readFile: (filePath: string) => Promise<string>
  on: (channel: string, callback: (event: IpcRendererEvent, ...args: unknown[]) => void) => void
  off: (channel: string, callback: (event: IpcRendererEvent, ...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}

export {}
