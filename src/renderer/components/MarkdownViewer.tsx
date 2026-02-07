import { useEffect, useMemo, useRef } from 'react'
import { parseMarkdownWithToc } from '../utils/markdown'
import githubTheme from 'highlight.js/styles/github.css?url'
import githubDarkTheme from 'highlight.js/styles/github-dark.css?url'

interface MarkdownViewerProps {
  content: string
  filePath?: string
  isDarkMode: boolean
  onTocChange?: (toc: { id: string; text: string; level: number }[]) => void
}

export default function MarkdownViewer({ content, isDarkMode, onTocChange }: MarkdownViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const parsed = useMemo(() => parseMarkdownWithToc(content), [content])

  useEffect(() => {
    const themeHref = isDarkMode ? githubDarkTheme : githubTheme
    let link = document.querySelector<HTMLLinkElement>('#hljs-theme')
    if (!link) {
      link = document.createElement('link')
      link.id = 'hljs-theme'
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
    if (link.href !== themeHref) {
      link.href = themeHref
    }
  }, [isDarkMode])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = parsed.html
    }
  }, [parsed])

  useEffect(() => {
    if (onTocChange) {
      onTocChange(parsed.toc)
    }
  }, [onTocChange, parsed.toc])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto" data-scroll-container="true">
        <div ref={containerRef} className="markdown-body max-w-4xl mx-auto px-8 py-8" />
      </div>
    </div>
  )
}
