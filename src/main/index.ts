import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

// The built directory structure
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null
let initialFilePath: string | null = null

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

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
    if (initialFilePath) {
      win?.webContents.send('open-initial-file', initialFilePath)
    }
  })
}

// IPC Handlers
ipcMain.handle('open-file', async () => {
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
    return { filePath, content }
  } catch (error) {
    console.error('Error reading file:', error)
    return null
  }
})

ipcMain.handle('read-file', async (_event, filePath: string) => {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch (error) {
    console.error('Error reading file:', error)
    throw error
  }
})

// App lifecycle
app.whenReady().then(() => {
  // Check for file path in command line args
  initialFilePath = getFilePathFromArgs()
  createWindow()
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
