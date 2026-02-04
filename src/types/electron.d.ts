export interface IElectronAPI {
  openFile: () => Promise<{ filePath: string; content: string } | null>
  readFile: (filePath: string) => Promise<string>
  on: (channel: string, callback: (...args: any[]) => void) => void
  off: (channel: string, callback: (...args: any[]) => void) => void
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}

export {}
