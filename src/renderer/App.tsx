import { useState, useEffect, useCallback } from 'react'
import type { IpcRendererEvent } from 'electron'
import MarkdownViewer from './components/MarkdownViewer'
import { Moon, Sun, Info, ListTree, FileText, Clock, ChevronRight, X } from 'lucide-react'
import appIcon from '../../icon.png'
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

interface TocItem {
  id: string
  text: string
  level: number
}

interface RecentFile {
  filePath: string
  fileName: string
  openedAt: string
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
  const [showToc, setShowToc] = useState(true)
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [activeTocId, setActiveTocId] = useState<string | null>(null)
  const [systemPrefersDark, setSystemPrefersDark] = useState(false)
  const [themePreference, setThemePreference] = useState<'system' | 'light' | 'dark'>('system')
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([])
  const [showAllRecents, setShowAllRecents] = useState(false)

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

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1024px)')
    const handleChange = (event: MediaQueryListEvent) => {
      setShowToc(!event.matches)
    }
    setShowToc(!mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

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
    if (!content) {
      setTocItems([])
      setActiveTocId(null)
    }
  }, [content])

  useEffect(() => {
    if (!tocItems.length) {
      setActiveTocId(null)
      return
    }

    const scrollContainer = document.querySelector<HTMLDivElement>('[data-scroll-container="true"]')
    const headings = tocItems
      .map(item => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element))

    if (!scrollContainer || headings.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        const visibleEntries = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1))
        if (visibleEntries.length > 0) {
          const id = (visibleEntries[0].target as HTMLElement).id
          setActiveTocId(id)
        }
      },
      {
        root: scrollContainer,
        rootMargin: '-80px 0px -70% 0px',
        threshold: [0, 1],
      }
    )

    headings.forEach(heading => observer.observe(heading))

    return () => {
      observer.disconnect()
    }
  }, [tocItems])

  useEffect(() => {
    const title = content ? documentTitle : 'Markdown Viewer'
    window.electronAPI.setWindowTitle(title)
  }, [content, documentTitle])

  useEffect(() => {
    window.electronAPI.setWindowHasContent(Boolean(content))
  }, [content])

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

  // Load recent files on mount and when returning to home screen
  useEffect(() => {
    const loadRecentFiles = async () => {
      try {
        const files = await window.electronAPI.getRecentFiles()
        setRecentFiles(files)
      } catch (err) {
        console.error('Error loading recent files:', err)
      }
    }

    if (!content) {
      loadRecentFiles()
      setShowAllRecents(false)
    }
  }, [content])

  const loadFile = useCallback(async (path: string) => {
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
  }, [])

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        const file = files[0]
        if (/\.(md|markdown|txt)$/i.test(file.name)) {
          const filePath = window.electronAPI.getPathForFile(file)
          loadFile(filePath)
        }
      }
    }

    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)

    return () => {
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
    }
  }, [loadFile])

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

    const closeHandler = () => {
      setContent('')
      setFilePath(null)
      setFileInfo(null)
      setShowInfo(false)
      setShowAbout(false)
      setError(null)
    }

    window.electronAPI.on('open-initial-file', handler)
    window.electronAPI.on('open-file-from-menu', menuHandler)
    window.electronAPI.on('show-about', aboutHandler)
    window.electronAPI.on('close-document', closeHandler)

    return () => {
      window.electronAPI.off('open-initial-file', handler)
      window.electronAPI.off('open-file-from-menu', menuHandler)
      window.electronAPI.off('show-about', aboutHandler)
      window.electronAPI.off('close-document', closeHandler)
    }
  }, [loadFile])

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

  const formatRelativeTime = (isoString: string): string => {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const handleOpenRecentFile = async (path: string) => {
    await loadFile(path)
  }

  const handleRemoveRecentFile = async (path: string, event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      await window.electronAPI.removeRecentFile(path)
      setRecentFiles(prev => prev.filter(f => f.filePath !== path))
    } catch (err) {
      console.error('Error removing recent file:', err)
    }
  }

  const displayedRecents = showAllRecents ? recentFiles : recentFiles.slice(0, 5)

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
        <div className="text-center max-w-lg w-full px-4">
          <img
            src={appIcon}
            alt="Markdown Viewer"
            className="w-24 h-24 mx-auto mb-6 rounded-2xl shadow-sm"
          />
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

          {recentFiles.length > 0 && (
            <div className="mt-8 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Recent Files
                </h2>
              </div>
              <ul className="space-y-1">
                {displayedRecents.map(file => (
                  <li key={file.filePath}>
                    <button
                      onClick={() => handleOpenRecentFile(file.filePath)}
                      className="w-full group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {file.fileName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {file.filePath}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {formatRelativeTime(file.openedAt)}
                      </span>
                      <button
                        onClick={e => handleRemoveRecentFile(file.filePath, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"
                        aria-label="Remove from recent files"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                    </button>
                  </li>
                ))}
              </ul>
              {recentFiles.length > 5 && (
                <button
                  onClick={() => setShowAllRecents(prev => !prev)}
                  className="mt-2 flex items-center gap-1 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  {showAllRecents ? (
                    <>Show Less</>
                  ) : (
                    <>
                      See More
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

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
            onClick={() => setShowToc(prev => !prev)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={showToc ? 'Hide table of contents' : 'Show table of contents'}
          >
            <ListTree className="w-4 h-4" />
          </button>
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">File Info</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{fileInfo.fileName}</p>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="inline-flex items-center rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Close
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-700 dark:text-gray-200">
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
            </div>
            {frontMatterEntries.length > 0 && (
              <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="space-y-3">
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
                </div>
              </div>
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
        <div className="flex h-full">
          {showToc && (
            <aside className="w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <div className="h-full overflow-y-auto px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Table of Contents
                </p>
                {tocItems.length === 0 ? (
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    No headings found.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-1">
                    {tocItems.map(item => {
                      const isActive = activeTocId === item.id
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => {
                              const target = document.getElementById(item.id)
                              const container = document.querySelector<HTMLDivElement>(
                                '[data-scroll-container="true"]'
                              )
                              const header = document.querySelector('header')
                              if (target && container) {
                                const headerOffset = header
                                  ? Math.round(header.getBoundingClientRect().height)
                                  : 0
                                const offsetTop = target.offsetTop - headerOffset - 16
                                container.scrollTo({
                                  top: Math.max(offsetTop, 0),
                                  behavior: 'smooth',
                                })
                              }
                            }}
                            className={`w-full rounded-md px-2 py-1 text-left text-sm transition-colors ${
                              isActive
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900'
                            }`}
                            style={{ paddingLeft: `${Math.min(item.level - 1, 5) * 12 + 8}px` }}
                          >
                            {item.text || 'Untitled'}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </aside>
          )}
          <div className="flex-1">
            <MarkdownViewer
              content={content}
              filePath={filePath || undefined}
              isDarkMode={isDarkMode}
              onTocChange={setTocItems}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
