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
let initialFilePayload: FileOpenResult | null = null
const REPO_URL = 'https://github.com/phenixcoder/markdown'

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
            if (win) {
              win.webContents.send('open-file-from-menu', result)
            } else {
              initialFilePayload = result
            }
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

function createWindow() {
  win = new BrowserWindow({
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
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(process.env.DIST!, 'index.html'))
  }

  // Send initial file path once ready
  win.webContents.on('did-finish-load', () => {
    if (initialFilePayload) {
      win?.webContents.send('open-file-from-menu', initialFilePayload)
      initialFilePayload = null
      return
    }
    if (initialFilePath) {
      win?.webContents.send('open-initial-file', initialFilePath)
    }
  })
}

// IPC Handlers
ipcMain.handle('open-file', async () => openFileFromDialog())

ipcMain.handle('read-file', async (_event, filePath: string) => {
  try {
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

ipcMain.on('set-window-title', (_event, title: string) => {
  if (win) {
    win.setTitle(title)
  }
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

// Handle file opening from system (double-click)
app.on('open-file', (event, filePath) => {
  event.preventDefault()
  if (win) {
    win.webContents.send('open-initial-file', filePath)
  } else {
    initialFilePath = filePath
  }
})
