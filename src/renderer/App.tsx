import { useState, useEffect } from 'react'
import type { IpcRendererEvent } from 'electron'
import MarkdownViewer from './components/MarkdownViewer'
import { FileText, Moon, Sun, Info } from 'lucide-react'
import './styles/markdown.css'

interface FrontMatterEntry {
  key: string
  value: string
}

interface ParsedMetadata {
  frontMatter: FrontMatterEntry[]
  titleFromFrontMatter?: string
  titleFromHeading?: string
}

interface FileInfo {
  filePath: string
  fileName: string
  size: number
  createdAt: string
  updatedAt: string
}

interface AppInfo {
  name: string
  version: string
  repoUrl: string
  iconDataUrl: string | null
}

function App() {
  const [content, setContent] = useState<string>('')
  const [filePath, setFilePath] = useState<string | null>(null)
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)
  const [systemPrefersDark, setSystemPrefersDark] = useState(false)
  const [themePreference, setThemePreference] = useState<'system' | 'light' | 'dark'>('system')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemPrefersDark(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  const isDarkMode = themePreference === 'system' ? systemPrefersDark : themePreference === 'dark'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
    document.documentElement.classList.toggle('light', !isDarkMode)
  }, [isDarkMode])

  const toggleTheme = () => {
    setThemePreference(prev => {
      if (prev === 'system') {
        return systemPrefersDark ? 'light' : 'dark'
      }
      return prev === 'dark' ? 'light' : 'dark'
    })
  }

  const parseFrontMatter = (markdown: string): ParsedMetadata => {
    const normalized = markdown.replace(/\r\n?/g, '\n')
    if (!normalized.startsWith('---\n')) {
      return { frontMatter: [] }
    }

    const closingIndex = normalized.indexOf('\n---', 4)
    if (closingIndex === -1) {
      return { frontMatter: [] }
    }

    const rawBlock = normalized.slice(4, closingIndex)
    const lines = rawBlock.split('\n').filter(line => line.trim().length > 0)
    const frontMatter = lines.map(line => {
      const separatorIndex = line.indexOf(':')
      if (separatorIndex === -1) {
        return { key: line.trim(), value: '' }
      }
      return {
        key: line.slice(0, separatorIndex).trim(),
        value: line.slice(separatorIndex + 1).trim(),
      }
    })

    const titleEntry = frontMatter.find(entry => entry.key.toLowerCase() === 'title')
    return {
      frontMatter,
      titleFromFrontMatter: titleEntry?.value,
    }
  }

  const getTitleFromHeading = (markdown: string): string | undefined => {
    const lines = markdown.replace(/\r\n?/g, '\n').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('# ')) {
        return trimmed.slice(2).trim()
      }
      if (trimmed.length > 0) {
        return undefined
      }
    }
    return undefined
  }

  const getTitleFromFileName = (path: string | null): string | undefined => {
    if (!path) {
      return undefined
    }
    const fileName = path.split(/[\\/]/).pop()
    if (!fileName) {
      return undefined
    }
    const lastDot = fileName.lastIndexOf('.')
    if (lastDot > 0) {
      return fileName.slice(0, lastDot)
    }
    return fileName
  }

  const resolveTitle = (markdown: string, path: string | null): string => {
    const frontMatter = parseFrontMatter(markdown)
    const titleFromHeading = getTitleFromHeading(markdown)
    return (
      frontMatter.titleFromFrontMatter ||
      titleFromHeading ||
      getTitleFromFileName(path) ||
      'Untitled'
    )
  }

  const extractFrontMatter = (markdown: string): FrontMatterEntry[] => {
    return parseFrontMatter(markdown).frontMatter
  }

  const formatFileSize = (size: number): string => {
    if (size < 1024) {
      return `${size} B`
    }
    const units = ['KB', 'MB', 'GB']
    let value = size / 1024
    let unitIndex = 0
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024
      unitIndex += 1
    }
    return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`
  }

  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString)
    if (Number.isNaN(date.getTime())) {
      return isoString
    }
    return date.toLocaleString()
  }

  const frontMatterEntries = extractFrontMatter(content)
  const documentTitle = resolveTitle(content, filePath)

  useEffect(() => {
    const title = content ? documentTitle : 'Markdown Viewer'
    window.electronAPI.setWindowTitle(title)
  }, [content, documentTitle])

  useEffect(() => {
    const loadAppInfo = async () => {
      try {
        const info = await window.electronAPI.getAppInfo()
        setAppInfo(info)
      } catch (err) {
        console.error('Error loading app info:', err)
      }
    }

    loadAppInfo()
  }, [])

  // Handle initial file opening from command line
  useEffect(() => {
    const handler = async (_event: IpcRendererEvent, ...args: unknown[]) => {
      const initialFilePath = args[0]
      if (typeof initialFilePath === 'string') {
        await loadFile(initialFilePath)
      }
    }

    const menuHandler = (_event: IpcRendererEvent, ...args: unknown[]) => {
      const payload = args[0]
      if (
        payload &&
        typeof payload === 'object' &&
        'content' in payload &&
        'filePath' in payload &&
        'fileInfo' in payload
      ) {
        const typedPayload = payload as { content: string; filePath: string; fileInfo: FileInfo }
        setContent(typedPayload.content)
        setFilePath(typedPayload.filePath)
        setFileInfo(typedPayload.fileInfo)
        setShowInfo(false)
      }
    }

    const aboutHandler = () => {
      setShowAbout(true)
    }

    window.electronAPI.on('open-initial-file', handler)
    window.electronAPI.on('open-file-from-menu', menuHandler)
    window.electronAPI.on('show-about', aboutHandler)

    return () => {
      window.electronAPI.off('open-initial-file', handler)
      window.electronAPI.off('open-file-from-menu', menuHandler)
      window.electronAPI.off('show-about', aboutHandler)
    }
  }, [])

  const loadFile = async (path: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.readFile(path)
      setContent(result.content)
      setFileInfo(result.fileInfo)
      setFilePath(path)
    } catch (err) {
      setError('Failed to load file')
      console.error('Error loading file:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading file...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-xl mb-4">{error}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Use File {'>'} Open to try again
          </p>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
        <div className="text-center max-w-md">
          <FileText className="w-24 h-24 mx-auto mb-6 text-gray-400" />
          <h1 className="text-3xl font-bold mb-4">Markdown Viewer</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Open a markdown file from the File menu to get started
          </p>
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center w-12 h-12 rounded-lg border border-border bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="mt-8 text-sm text-gray-500">
            <p>Or drag & drop a file here</p>
            <p className="mt-2">Supports .md, .markdown, .txt files</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <header className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {documentTitle}
          </h1>
          {/* {filePath && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={filePath}>
              {filePath}
            </p>
          )} */}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(prev => !prev)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle file info"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>
      {showInfo && fileInfo && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950">
          <div className="grid grid-cols-1 gap-2 text-sm text-gray-700 dark:text-gray-200">
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">File name:</span>{' '}
              {fileInfo.fileName}
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">Full path:</span>{' '}
              <span className="break-all">{fileInfo.filePath}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">File size:</span>{' '}
              {formatFileSize(fileInfo.size)}
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">Created:</span>{' '}
              {formatDateTime(fileInfo.createdAt)}
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">Updated:</span>{' '}
              {formatDateTime(fileInfo.updatedAt)}
            </div>
            {frontMatterEntries.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                {frontMatterEntries.map(entry => (
                  <div key={`${entry.key}-${entry.value}`} className="space-y-1">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {entry.key}
                    </div>
                    <div className="font-mono text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                      {entry.value || '-'}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
      {showAbout && appInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowAbout(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              {appInfo.iconDataUrl ? (
                <img
                  src={appInfo.iconDataUrl}
                  alt={appInfo.name}
                  className="h-16 w-16 rounded-lg"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-800" />
              )}
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {appInfo.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Version {appInfo.version}
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={() => window.electronAPI.openExternal(appInfo.repoUrl)}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.54 2.87 8.38 6.84 9.74.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.17-1.1-1.48-1.1-1.48-.9-.64.07-.63.07-.63 1 .07 1.52 1.05 1.52 1.05.9 1.57 2.36 1.12 2.94.86.09-.66.35-1.12.64-1.38-2.22-.26-4.56-1.15-4.56-5.1 0-1.13.39-2.05 1.03-2.78-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05.8-.23 1.65-.34 2.5-.34.85 0 1.7.12 2.5.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.73 1.03 1.65 1.03 2.78 0 3.96-2.35 4.84-4.59 5.1.36.32.69.94.69 1.9 0 1.37-.01 2.47-.01 2.8 0 .26.18.59.69.48 3.96-1.36 6.83-5.2 6.83-9.74C22 6.58 17.52 2 12 2z" />
                </svg>
                GitHub
              </button>
              <button
                onClick={() => setShowAbout(false)}
                className="inline-flex items-center rounded-md border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="flex-1 overflow-hidden">
        <MarkdownViewer content={content} filePath={filePath || undefined} />
      </main>
    </div>
  )
}

export default App
