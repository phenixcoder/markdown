# 🤖 Agent Guidelines for Markdown Viewer

> Instructions for AI coding agents working in this repository

## 📦 Project Overview

**Tech Stack:** Electron 32 + React 18 + TypeScript 5 + Vite 5 + TailwindCSS 3  
**Architecture:** Main process (Node.js) + Renderer process (React) with IPC communication  
**Repository:** https://github.com/phenixcoder/markdown

---

## 🛠️ Build, Lint & Test Commands

### Development
```bash
npm run dev                    # Start Vite dev server (renderer only)
npm run electron:dev           # Same as dev (alias)
npm run preview                # Preview production build
```

### Building
```bash
npm run build                  # Full build: TypeScript → Vite → electron-builder (no publish)
npm run electron:build         # Build with publish enabled (for releases)
npx tsc --noEmit              # Type check only (no output)
```

### Linting & Formatting
```bash
npm run lint                   # ESLint check (fails on warnings)
npm run format                 # Prettier format all src files
```

### Testing
```bash
npm test                       # Run all Vitest unit tests (watch mode)
npm run test:ui                # Vitest UI dashboard
npm run test:e2e               # Playwright E2E tests

# Run single test file
npx vitest run tests/unit/app.test.ts

# Run single test by name pattern
npx vitest run -t "renders without crashing"

# Run tests in specific directory
npx vitest run tests/unit/
```

---

## 📁 Project Structure

```
src/
├── main/               # Electron main process (Node.js)
│   ├── index.ts       # Main entry, window creation, IPC handlers
│   └── preload.ts     # Context bridge for secure IPC
├── renderer/          # React renderer process (browser)
│   ├── App.tsx        # Root component
│   ├── components/    # React components
│   ├── utils/         # Utility functions (markdown parser, etc.)
│   └── styles/        # CSS files
└── types/             # TypeScript type definitions
    └── electron.d.ts  # Window API types

build/                 # Static assets (icons)
release/               # Build output (gitignored)
tests/                 # Test files
```

---

## 🎨 Code Style Guidelines

### Import Order
```typescript
// 1. External libraries (React, Electron, etc.)
import { app, BrowserWindow } from 'electron'
import { useState, useEffect } from 'react'

// 2. Internal modules (utils, components)
import MarkdownViewer from './components/MarkdownViewer'
import { parseMarkdown } from './utils/markdown'

// 3. Types
import { IpcRendererEvent } from 'electron'

// 4. CSS/Assets
import './styles/markdown.css'
```

### TypeScript Types
- **NEVER use `any`** - Use `unknown` and type guards instead
- Always provide explicit return types for functions
- Use proper Electron types: `IpcRendererEvent`, `BrowserWindow`, etc.
- Prefer `interface` for objects, `type` for unions/intersections

```typescript
// ✅ Good
const handler = async (_event: IpcRendererEvent, ...args: unknown[]): Promise<void> => {
  const filePath = args[0]
  if (typeof filePath === 'string') {
    await loadFile(filePath)
  }
}

// ❌ Bad - uses 'any'
const handler = async (_event: any, filePath: any) => {
  await loadFile(filePath)
}
```

### Naming Conventions
- **Components:** PascalCase (`MarkdownViewer.tsx`)
- **Functions:** camelCase (`loadFile`, `parseMarkdown`)
- **Constants:** UPPER_SNAKE_CASE (`VITE_DEV_SERVER_URL`)
- **Interfaces:** PascalCase with `I` prefix (`IElectronAPI`)
- **Unused params:** Prefix with underscore (`_event`)

### React Patterns
- Use functional components with hooks
- Explicit typing for state: `useState<string>('')`
- Clean up effects with return functions
- Keep components focused and small

```typescript
function App() {
  const [content, setContent] = useState<string>('')
  
  useEffect(() => {
    const handler = async () => { /* ... */ }
    window.electronAPI.on('event', handler)
    
    return () => {
      window.electronAPI.off('event', handler)
    }
  }, [])
}
```

### Error Handling
- Always wrap async operations in try-catch
- Log errors to console with context
- Show user-friendly error messages in UI
- Use null/undefined for missing values, not exceptions

```typescript
try {
  const content = await window.electronAPI.readFile(path)
  setContent(content)
} catch (err) {
  setError('Failed to load file')
  console.error('Error loading file:', err)
}
```

---

## 🔒 Security Requirements

**Context Isolation is ENABLED** - Main process uses `__dirname`, renderer uses IPC:
- NO `require()` in renderer process
- NO `fs` or `path` directly in renderer
- ALL file operations through IPC (`window.electronAPI`)
- Sanitize markdown with DOMPurify before rendering

---

## 🚫 Common Pitfalls to Avoid

1. **ES Modules:** Do NOT add `"type": "module"` to package.json (breaks `__dirname`)
2. **Any Types:** ESLint will fail on `any` - use proper types or `unknown`
3. **Publishing:** Build script uses `--publish never` for CI (no GitHub token needed)
4. **Unused Vars:** Prefix with `_` if intentionally unused
5. **Import Extensions:** Don't use `.js` in imports - TypeScript handles it

---

## 📝 Git Commit Guidelines

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style (formatting, no logic change)
- `refactor:` - Code restructuring
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks

---

## 🎯 Current Development Focus

See `ROADMAP.md` for detailed status. Currently on Phase 3:
- ✅ Core markdown rendering working
- ✅ File opening via dialog and CLI
- 🔲 Next: File associations, recent files, drag & drop

---

## 📚 Key Dependencies

- **marked** v12 - Markdown parser (GFM enabled)
- **highlight.js** v11 - Syntax highlighting
- **DOMPurify** v3 - XSS sanitization
- **lucide-react** - Icon components
- **electron-builder** v24 - Multi-platform packaging

---

**Last Updated:** Feb 4, 2026  
**Node Version:** 22+ (or 20.19.0+)  
**Electron Version:** 32.3.3
