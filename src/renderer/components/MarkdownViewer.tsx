import { useEffect, useMemo, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { parseMarkdownWithToc } from '../utils/markdown'
import MermaidModal from './MermaidModal'
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
  const [modalSvg, setModalSvg] = useState<string | null>(null)

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

      const mermaidElements = containerRef.current.querySelectorAll('.mermaid')
      if (mermaidElements.length > 0) {
        mermaid.initialize({
          startOnLoad: false,
          theme: isDarkMode ? 'dark' : 'default',
        })
        mermaid.run({ nodes: mermaidElements as NodeListOf<HTMLElement> }).then(() => {
          mermaidElements.forEach(el => {
            el.classList.add('cursor-pointer', 'hover:opacity-80', 'transition-opacity')
            el.setAttribute('title', 'Click to expand')
            el.addEventListener('click', () => {
              const svg = el.querySelector('svg')
              if (svg) {
                setModalSvg(svg.outerHTML)
              }
            })
          })
        })
      }
    }
  }, [parsed, isDarkMode])

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
      {modalSvg && (
        <MermaidModal
          svgContent={modalSvg}
          onClose={() => setModalSvg(null)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  )
}
