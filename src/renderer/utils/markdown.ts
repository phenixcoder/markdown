import { marked } from 'marked'
import hljs from 'highlight.js'
import DOMPurify from 'isomorphic-dompurify'

// Configure marked with GitHub Flavored Markdown
marked.use({
  gfm: true,
  breaks: true,
})

export interface TocItem {
  id: string
  text: string
  level: number
}

const createSlugger = () => {
  const seen = new Map<string, number>()

  return (value: string): string => {
    const base = value
      .toLowerCase()
      .trim()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    const slug = base.length > 0 ? base : 'section'
    const count = seen.get(slug) ?? 0
    seen.set(slug, count + 1)
    if (count === 0) {
      return slug
    }
    return `${slug}-${count + 1}`
  }
}

const stripHtml = (value: string): string => value.replace(/<[^>]*>/g, '')

const createRenderer = (toc?: TocItem[]) => {
  const renderer = new marked.Renderer()
  const slugger = createSlugger()
  let mermaidBlockId = 0

  renderer.code = function (code: string, language: string | undefined) {
    if (language === 'mermaid') {
      const id = `mermaid-${mermaidBlockId++}`
      return `<div class="mermaid" data-mermaid-id="${id}">${code}</div>`
    }

    if (language && hljs.getLanguage(language)) {
      try {
        const highlighted = hljs.highlight(code, { language }).value
        return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
      } catch (err) {
        console.error('Highlight error:', err)
      }
    }
    const highlighted = hljs.highlightAuto(code).value
    return `<pre><code class="hljs">${highlighted}</code></pre>`
  }

  renderer.heading = function (text: string, level: number) {
    const headingText = stripHtml(text).trim()
    const id = slugger(headingText)
    if (toc) {
      toc.push({ id, text: headingText, level })
    }
    return `<h${level} id="${id}">${text}</h${level}>`
  }

  return renderer
}

export function parseMarkdown(markdown: string): string {
  const renderer = createRenderer()
  const html = marked.parse(markdown, { renderer }) as string
  return DOMPurify.sanitize(html)
}

export function parseMarkdownWithToc(markdown: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = []
  const renderer = createRenderer(toc)
  const html = marked.parse(markdown, { renderer }) as string
  return {
    html: DOMPurify.sanitize(html),
    toc,
  }
}

export function isMarkdownFile(filePath: string): boolean {
  return /\.(md|markdown|txt)$/i.test(filePath)
}
