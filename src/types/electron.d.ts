import { IpcRendererEvent } from 'electron'

export interface IFileInfo {
  filePath: string
  fileName: string
  size: number
  createdAt: string
  updatedAt: string
}

export interface IFilePayload {
  filePath: string
  content: string
  fileInfo: IFileInfo
}

export interface IReadFilePayload {
  content: string
  fileInfo: IFileInfo
}

export interface IAppInfo {
  name: string
  version: string
  repoUrl: string
  iconDataUrl: string | null
}

export interface IElectronAPI {
  openFile: () => Promise<IFilePayload | null>
  readFile: (filePath: string) => Promise<IReadFilePayload>
  setWindowTitle: (title: string) => void
  setWindowHasContent: (hasContent: boolean) => void
  getAppInfo: () => Promise<IAppInfo>
  openExternal: (url: string) => Promise<void>
  getPathForFile: (file: File) => string
  on: (channel: string, callback: (event: IpcRendererEvent, ...args: unknown[]) => void) => void
  off: (channel: string, callback: (event: IpcRendererEvent, ...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}

export {}
