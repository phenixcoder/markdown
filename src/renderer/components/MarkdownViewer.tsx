import { useEffect, useRef } from 'react'
import { parseMarkdown } from '../utils/markdown'
import 'highlight.js/styles/github.css'

interface MarkdownViewerProps {
  content: string
  filePath?: string
}

export default function MarkdownViewer({ content, filePath }: MarkdownViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      const html = parseMarkdown(content)
      containerRef.current.innerHTML = html
    }
  }, [content])

  return (
    <div className="flex flex-col h-full">
      {filePath && (
        <div className="px-6 py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate" title={filePath}>
            {filePath}
          </p>
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <div ref={containerRef} className="markdown-body max-w-4xl mx-auto px-8 py-8" />
      </div>
    </div>
  )
}
