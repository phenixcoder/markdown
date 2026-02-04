import { useState, useEffect } from 'react'
import { IpcRendererEvent } from 'electron'
import MarkdownViewer from './components/MarkdownViewer'
import { FileText, FolderOpen, Moon, Sun } from 'lucide-react'
import './styles/markdown.css'

function App() {
  const [content, setContent] = useState<string>('')
  const [filePath, setFilePath] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  // Handle initial file opening from command line
  useEffect(() => {
    const handler = async (_event: IpcRendererEvent, ...args: unknown[]) => {
      const initialFilePath = args[0]
      if (typeof initialFilePath === 'string') {
        await loadFile(initialFilePath)
      }
    }

    window.electronAPI.on('open-initial-file', handler)

    return () => {
      window.electronAPI.off('open-initial-file', handler)
    }
  }, [])

  const loadFile = async (path: string) => {
    setLoading(true)
    setError(null)
    try {
      const fileContent = await window.electronAPI.readFile(path)
      setContent(fileContent)
      setFilePath(path)
    } catch (err) {
      setError('Failed to load file')
      console.error('Error loading file:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenFile = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.openFile()
      if (result) {
        setContent(result.content)
        setFilePath(result.filePath)
      }
    } catch (err) {
      setError('Failed to open file')
      console.error('Error opening file:', err)
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
          <button
            onClick={handleOpenFile}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
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
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Open a markdown file to get started
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleOpenFile}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <FolderOpen className="w-5 h-5" />
              Open File
            </button>
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center w-12 h-12 rounded-lg border border-border bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
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
        <h1 className="text-lg font-semibold">Markdown Viewer</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={handleOpenFile}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            Open File
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <MarkdownViewer content={content} filePath={filePath || undefined} />
      </main>
    </div>
  )
}

export default App
