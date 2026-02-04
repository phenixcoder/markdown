import { useEffect, useRef } from 'react'
import { parseMarkdown } from '../utils/markdown'
import githubTheme from 'highlight.js/styles/github.css?url'
import githubDarkTheme from 'highlight.js/styles/github-dark.css?url'

interface MarkdownViewerProps {
  content: string
  filePath?: string
  isDarkMode: boolean
}

export default function MarkdownViewer({ content, isDarkMode }: MarkdownViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

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
      const html = parseMarkdown(content)
      containerRef.current.innerHTML = html
    }
  }, [content])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div ref={containerRef} className="markdown-body max-w-4xl mx-auto px-8 py-8" />
      </div>
    </div>
  )
}
