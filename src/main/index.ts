import { app, BrowserWindow, ipcMain, dialog, Menu, shell } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

// The built directory structure
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null
let initialFilePath: string | null = null
const windowPayloads = new Map<number, FileOpenResult>()
const windowHasContent = new Map<number, boolean>()
const REPO_URL = 'https://github.com/phenixcoder/markdown'

// Recent files storage
const MAX_RECENT_FILES = 20
const recentFilesPath = path.join(app.getPath('userData'), 'recent-files.json')

interface RecentFile {
  filePath: string
  fileName: string
  openedAt: string
}

function loadRecentFiles(): RecentFile[] {
  try {
    if (fs.existsSync(recentFilesPath)) {
      const data = fs.readFileSync(recentFilesPath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading recent files:', error)
  }
  return []
}

function saveRecentFiles(files: RecentFile[]): void {
  try {
    fs.writeFileSync(recentFilesPath, JSON.stringify(files, null, 2))
  } catch (error) {
    console.error('Error saving recent files:', error)
  }
}

function addToRecentFiles(filePath: string): void {
  const files = loadRecentFiles()
  const fileName = path.basename(filePath)
  const newEntry: RecentFile = {
    filePath,
    fileName,
    openedAt: new Date().toISOString(),
  }

  const filtered = files.filter(f => f.filePath !== filePath)
  filtered.unshift(newEntry)
  const trimmed = filtered.slice(0, MAX_RECENT_FILES)
  saveRecentFiles(trimmed)
}

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

app.setName('Markdown Viewer')
app.setAboutPanelOptions({
  applicationName: 'Markdown Viewer',
  applicationVersion: app.getVersion(),
  website: REPO_URL,
})

app.disableHardwareAcceleration()
app.commandLine.appendSwitch('disable-gpu')

process.on('uncaughtException', error => {
  console.error('Main process uncaught exception:', error)
})

process.on('unhandledRejection', reason => {
  console.error('Main process unhandled rejection:', reason)
})

app.on('render-process-gone', (_event, _webContents, details) => {
  console.error('Renderer process gone:', details)
})

app.on('child-process-gone', (_event, details) => {
  console.error('Child process gone:', details)
})

interface FileInfo {
  filePath: string
  fileName: string
  size: number
  createdAt: string
  updatedAt: string
}

interface FileOpenResult {
  filePath: string
  content: string
  fileInfo: FileInfo
}

function buildFileInfo(filePath: string): FileInfo {
  const stats = fs.statSync(filePath)
  return {
    filePath,
    fileName: path.basename(filePath),
    size: stats.size,
    createdAt: stats.birthtime.toISOString(),
    updatedAt: stats.mtime.toISOString(),
  }
}

async function openFileFromDialog(): Promise<FileOpenResult | null> {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  const filePath = result.filePaths[0]
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return {
      filePath,
      content,
      fileInfo: buildFileInfo(filePath),
    }
  } catch (error) {
    console.error('Error reading file:', error)
    return null
  }
}

function createAppMenu() {
  const template = [
    ...(process.platform === 'darwin'
      ? ([
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ] as Electron.MenuItemConstructorOptions[])
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await openFileFromDialog()
            if (!result) {
              return
            }
            const targetWindow = win
            const shouldOpenNewWindow =
              targetWindow && windowHasContent.get(targetWindow.id) === true
            if (shouldOpenNewWindow) {
              createWindow(result)
              return
            }
            if (targetWindow) {
              targetWindow.webContents.send('open-file-from-menu', result)
            } else {
              createWindow(result)
            }
          },
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow()
            focusedWindow?.webContents.send('close-document')
          },
        },
        { type: 'separator' },
        ...(process.platform === 'darwin'
          ? ([] as Electron.MenuItemConstructorOptions[])
          : [{ role: 'quit' }]),
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        ...(process.env.VITE_DEV_SERVER_URL
          ? [{ role: 'toggledevtools' }]
          : ([] as Electron.MenuItemConstructorOptions[])),
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            win?.webContents.send('show-about')
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// Get file path from command line arguments
function getFilePathFromArgs(): string | null {
  const args = process.argv.slice(app.isPackaged ? 1 : 2)
  const filePath = args.find(arg => !arg.startsWith('-') && /\.(md|markdown|txt)$/i.test(arg))

  if (filePath && fs.existsSync(filePath)) {
    return path.resolve(filePath)
  }
  return null
}

function createWindow(payload?: FileOpenResult) {
  const newWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: 'Markdown Viewer',
  })

  // Load the app
  if (VITE_DEV_SERVER_URL) {
    newWindow.loadURL(VITE_DEV_SERVER_URL)
    newWindow.webContents.openDevTools()
  } else {
    newWindow.loadFile(path.join(process.env.DIST!, 'index.html'))
  }

  // Send initial file path once ready
  newWindow.webContents.on('did-finish-load', () => {
    const queuedPayload = windowPayloads.get(newWindow.id)
    if (queuedPayload) {
      newWindow.webContents.send('open-file-from-menu', queuedPayload)
      windowPayloads.delete(newWindow.id)
      return
    }
    if (initialFilePath) {
      newWindow.webContents.send('open-initial-file', initialFilePath)
    }
  })

  newWindow.on('closed', () => {
    windowPayloads.delete(newWindow.id)
    windowHasContent.delete(newWindow.id)
    if (win?.id === newWindow.id) {
      win = null
    }
  })

  if (!win) {
    win = newWindow
  }

  if (payload) {
    windowPayloads.set(newWindow.id, payload)
  }

  return newWindow
}

// IPC Handlers
ipcMain.handle('open-file', async () => openFileFromDialog())

ipcMain.handle('read-file', async (_event, filePath: string) => {
  try {
    addToRecentFiles(filePath)
    return {
      content: fs.readFileSync(filePath, 'utf-8'),
      fileInfo: buildFileInfo(filePath),
    }
  } catch (error) {
    console.error('Error reading file:', error)
    throw error
  }
})

ipcMain.handle('get-app-info', () => {
  const iconPath = path.join(app.getAppPath(), 'icon.png')
  let iconDataUrl: string | null = null
  try {
    const iconBuffer = fs.readFileSync(iconPath)
    iconDataUrl = `data:image/png;base64,${iconBuffer.toString('base64')}`
  } catch (error) {
    console.error('Error reading app icon:', error)
  }

  return {
    name: app.name,
    version: app.getVersion(),
    repoUrl: REPO_URL,
    iconDataUrl,
  }
})

ipcMain.handle('open-external', async (_event, url: string) => {
  if (typeof url === 'string' && url.length > 0) {
    await shell.openExternal(url)
  }
})

ipcMain.on('set-window-title', (event, title: string) => {
  const senderWindow = BrowserWindow.fromWebContents(event.sender)
  if (senderWindow) {
    senderWindow.setTitle(title)
  }
})

ipcMain.on('set-window-has-content', (event, hasContent: boolean) => {
  const senderWindow = BrowserWindow.fromWebContents(event.sender)
  if (senderWindow) {
    windowHasContent.set(senderWindow.id, hasContent)
  }
})

ipcMain.handle('get-recent-files', () => {
  return loadRecentFiles()
})

ipcMain.handle('clear-recent-files', () => {
  saveRecentFiles([])
  return []
})

ipcMain.handle('remove-recent-file', (_event, filePath: string) => {
  const files = loadRecentFiles()
  const filtered = files.filter(f => f.filePath !== filePath)
  saveRecentFiles(filtered)
  return filtered
})

// App lifecycle
app.whenReady().then(() => {
  // Check for file path in command line args
  initialFilePath = getFilePathFromArgs()
  createWindow()
  createAppMenu()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('open-file', (event, filePath) => {
  event.preventDefault()

  if (!app.isReady()) {
    initialFilePath = filePath
    return
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const payload: FileOpenResult = {
      filePath,
      content,
      fileInfo: buildFileInfo(filePath),
    }
    addToRecentFiles(filePath)
    createWindow(payload)
  } catch (error) {
    console.error('Error opening file from system:', error)
  }
})
