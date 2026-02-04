import { marked } from 'marked'
import hljs from 'highlight.js'
import DOMPurify from 'isomorphic-dompurify'

// Configure marked with GitHub Flavored Markdown
marked.setOptions({
  gfm: true,
  breaks: true,
  highlight: (code: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.error('Highlight error:', err)
      }
    }
    return hljs.highlightAuto(code).value
  },
})

export function parseMarkdown(markdown: string): string {
  const html = marked.parse(markdown) as string
  return DOMPurify.sanitize(html)
}

export function isMarkdownFile(filePath: string): boolean {
  return /\.(md|markdown|txt)$/i.test(filePath)
}
