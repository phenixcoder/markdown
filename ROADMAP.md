# 🗺️ Markdown Viewer - Development Roadmap

> Modern Electron-based markdown viewer with React, TypeScript, and TailwindCSS

**Repository:** https://github.com/phenixcoder/markdown  
**Starting Version:** 0.1.0  
**Target Platform:** macOS, Windows, Linux

---

## 📋 Overview

This roadmap outlines the complete rebuild of the markdown viewer from a legacy Electron v13 app to a modern, secure, feature-rich desktop application with automated CI/CD and multi-platform distribution.

### **Tech Stack**
- **Frontend:** React 18 + TypeScript + TailwindCSS
- **Desktop:** Electron 40 + Vite
- **Markdown:** marked + highlight.js
- **Editor:** CodeMirror 6
- **Testing:** Vitest (unit) + Playwright (E2E)
- **CI/CD:** GitHub Actions
- **Packaging:** electron-builder

---

## 🎯 Development Phases

### **Phase 0: Preparation** ✅
**Status:** Ready to start  
**Timeline:** 0.5 hours

- [x] Analyze legacy codebase
- [x] Create comprehensive roadmap
- [ ] Move legacy code to separate branch
- [ ] Clean workspace for fresh start

**Deliverables:**
- ROADMAP.md (this file)
- Clean repository structure

---

### **Phase 1: Foundation Setup** 🏗️
**Version:** 0.1.0-alpha.1  
**Timeline:** 2 hours  
**Priority:** HIGH

#### Tasks
- [ ] Initialize Vite + Electron + React + TypeScript project
- [ ] Install core dependencies (React, Electron, marked, etc.)
- [ ] Configure TypeScript (3 configs: main, renderer, node)
- [ ] Set up ESLint + Prettier with recommended configs
- [ ] Configure TailwindCSS with custom theme
- [ ] Create basic Electron window with security settings
- [ ] Set up preload script with context bridge
- [ ] Configure IPC communication channels
- [ ] Create minimal React renderer
- [ ] Set up project folder structure

#### Dependencies to Install
```json
{
  "electron": "^40.1.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "vite": "^5.1.0",
  "vite-plugin-electron": "^0.28.0",
  "typescript": "^5.3.3"
}
```

#### Deliverables
- Working Electron app with React renderer
- TypeScript compilation working
- Hot module replacement functional
- Basic window (800x600) opening successfully

---

### **Phase 2: Core Markdown Rendering** 📝
**Version:** 0.1.0-alpha.2  
**Timeline:** 2 hours  
**Priority:** HIGH

#### Tasks
- [ ] Install and configure `marked` library
- [ ] Enable GitHub Flavored Markdown (GFM)
- [ ] Integrate `highlight.js` for syntax highlighting
- [ ] Add DOMPurify for XSS protection
- [ ] Create MarkdownViewer component
- [ ] Design GitHub-like markdown styles (CSS)
- [ ] Implement theme system (light/dark modes)
- [ ] Create ThemeContext and ThemeProvider
- [ ] Add system preference detection
- [ ] Persist theme preference using electron-store
- [ ] Style code blocks with line numbers
- [ ] Handle markdown parsing errors gracefully

#### Dependencies to Install
```json
{
  "marked": "^12.0.0",
  "highlight.js": "^11.9.0",
  "dompurify": "^3.0.9",
  "isomorphic-dompurify": "^2.9.0",
  "electron-store": "^8.2.0"
}
```

#### Deliverables
- Functional markdown preview component
- Light and dark themes working
- Syntax highlighting for code blocks
- Theme persists between sessions

---

### **Phase 3: File Association** 🔗
**Version:** 0.1.0-alpha.3  
**Timeline:** 3 hours  
**Priority:** HIGH

#### Tasks
- [ ] Configure electron-builder file associations
- [ ] Implement protocol handler for custom URLs
- [ ] Handle `open-file` event (macOS)
- [ ] Handle `second-instance` event (Windows/Linux)
- [ ] Parse command-line arguments on startup
- [ ] Support multiple file formats (.md, .markdown, .txt)
- [ ] Create platform-specific configs (Info.plist, registry, .desktop)
- [ ] Test double-click file opening on macOS
- [ ] Test double-click file opening on Windows
- [ ] Test double-click file opening on Linux
- [ ] Handle invalid file paths gracefully
- [ ] Show error dialog for unreadable files

#### Configuration Files
- `electron-builder.yml` - File association config
- `build/entitlements.mac.plist` - macOS permissions
- Platform-specific build scripts

#### Deliverables
- .md files open with app on double-click
- Command-line file opening works (`markdown-viewer file.md`)
- File association works on all platforms

---

### **Phase 4: Source View Mode** 👁️
**Version:** 0.1.0-alpha.4  
**Timeline:** 2 hours  
**Priority:** MEDIUM

#### Tasks
- [ ] Create SourceViewer component
- [ ] Add syntax highlighting for raw markdown
- [ ] Implement view mode state management
- [ ] Create view mode toggle buttons (Preview/Source/Split)
- [ ] Build split-pane layout component
- [ ] Implement resizable divider for split view
- [ ] Add scroll synchronization between panes
- [ ] Implement keyboard shortcut (Ctrl+Shift+S)
- [ ] Persist last used view mode
- [ ] Add copy-to-clipboard for source view
- [ ] Style source view with monospace font
- [ ] Add line numbers to source view

#### Components to Build
- `SourceViewer.tsx` - Raw markdown display
- `SplitView.tsx` - Split pane layout
- `ViewModeToggle.tsx` - Mode switcher

#### Deliverables
- Three view modes: Preview, Source, Split
- Smooth transitions between modes
- Scroll sync in split mode
- Keyboard shortcuts working

---

### **Phase 5: Edit Mode** ✏️
**Version:** 0.1.0-beta.1  
**Timeline:** 3 hours  
**Priority:** MEDIUM

#### Tasks
- [ ] Install and configure CodeMirror 6
- [ ] Add markdown language support
- [ ] Configure editor extensions (autocomplete, keybindings)
- [ ] Create Editor component
- [ ] Implement debounced live preview
- [ ] Add character/word count display
- [ ] Implement save file handler (IPC)
- [ ] Add "Save As" dialog
- [ ] Show unsaved changes indicator (*)
- [ ] Warn on close with unsaved changes
- [ ] Implement auto-save with configurable interval
- [ ] Integrate chokidar for file watching
- [ ] Show reload prompt on external file change
- [ ] Handle file deletion/rename gracefully

#### Dependencies to Install
```json
{
  "@codemirror/view": "^6.0.0",
  "@codemirror/state": "^6.0.0",
  "@codemirror/lang-markdown": "^6.2.4",
  "@codemirror/theme-one-dark": "^6.1.2",
  "chokidar": "^3.6.0"
}
```

#### Deliverables
- Fully functional markdown editor
- Live preview while typing
- Save/Save As working
- Auto-save option available
- File watcher detecting external changes

---

### **Phase 6: File Operations** 📂
**Version:** 0.1.0-beta.2  
**Timeline:** 2 hours  
**Priority:** MEDIUM

#### Tasks
- [ ] Implement "Open File" dialog
- [ ] Filter by .md, .markdown, .txt extensions
- [ ] Remember last opened directory
- [ ] Create drag-and-drop area
- [ ] Handle file validation on drop
- [ ] Show drop zone indicator
- [ ] Store recent files list (max 10)
- [ ] Create recent files dropdown/menu
- [ ] Handle missing/deleted recent files
- [ ] Add "Clear Recent Files" option
- [ ] Create Toolbar component
- [ ] Add toolbar buttons (Open, Save, View, Theme)
- [ ] Show keyboard shortcut hints in tooltips
- [ ] Make toolbar responsive

#### Components to Build
- `Toolbar.tsx` - Top toolbar
- `RecentFiles.tsx` - Recent files menu
- `FileDropZone.tsx` - Drag-and-drop area

#### Deliverables
- File open dialog working
- Drag-and-drop functional
- Recent files persisted and accessible
- Clean, intuitive toolbar

---

### **Phase 7: Settings & Preferences** ⚙️
**Version:** 0.1.0-beta.3  
**Timeline:** 1 hour  
**Priority:** MEDIUM

#### Tasks
- [ ] Define settings schema (TypeScript interface)
- [ ] Implement settings context/provider
- [ ] Create Settings modal component
- [ ] Add theme preference selector (light/dark/auto)
- [ ] Add default view mode selector
- [ ] Add auto-save interval input
- [ ] Add font family/size selectors for editor
- [ ] Add custom CSS textarea for preview
- [ ] Add line wrapping toggle
- [ ] Add line numbers toggle
- [ ] Add syntax highlighting theme selector
- [ ] Implement "Reset to Defaults" button
- [ ] Validate settings input
- [ ] Apply settings changes immediately
- [ ] Persist settings with electron-store

#### Settings to Include
```typescript
interface Settings {
  theme: 'light' | 'dark' | 'auto';
  defaultViewMode: 'preview' | 'source' | 'split';
  autoSaveInterval: number; // seconds, 0 = disabled
  editorFontFamily: string;
  editorFontSize: number;
  customCSS: string;
  lineWrapping: boolean;
  showLineNumbers: boolean;
  syntaxTheme: string;
}
```

#### Deliverables
- Settings modal accessible (Ctrl+,)
- All settings persist between sessions
- Settings apply immediately on change

---

### **Phase 8: Testing Infrastructure** 🧪
**Version:** 0.1.0-rc.1  
**Timeline:** 2 hours  
**Priority:** HIGH

#### Tasks
- [ ] Configure Vitest for unit tests
- [ ] Configure Playwright for E2E tests
- [ ] Create test utilities and helpers
- [ ] Set up test coverage reporting
- [ ] Write markdown parsing tests
- [ ] Write file operations tests
- [ ] Write theme switching tests
- [ ] Write settings persistence tests
- [ ] Write IPC communication tests
- [ ] Create E2E test for file opening flow
- [ ] Create E2E test for edit-save workflow
- [ ] Create E2E test for view mode switching
- [ ] Create E2E test for theme switching
- [ ] Create E2E test for drag-and-drop
- [ ] Create E2E test for keyboard shortcuts
- [ ] Achieve >80% code coverage

#### Dependencies to Install
```json
{
  "vitest": "^1.2.2",
  "@vitest/ui": "^1.2.2",
  "playwright": "^1.41.2",
  "@playwright/test": "^1.41.2",
  "@testing-library/react": "^14.2.1",
  "@testing-library/user-event": "^14.5.2"
}
```

#### Test Files to Create
- `tests/unit/markdown.test.ts`
- `tests/unit/file-handler.test.ts`
- `tests/unit/theme.test.ts`
- `tests/e2e/file-open.spec.ts`
- `tests/e2e/edit-save.spec.ts`
- `tests/e2e/view-modes.spec.ts`

#### Deliverables
- Full unit test suite passing
- E2E tests covering critical workflows
- Coverage report >80%
- CI-ready test commands

---

### **Phase 9: Polish & UX** 🎨
**Version:** 0.1.0-rc.2  
**Timeline:** 2 hours  
**Priority:** MEDIUM

#### Tasks
- [ ] Add React error boundaries
- [ ] Handle file read/write errors gracefully
- [ ] Show user-friendly error messages
- [ ] Add error logging to file (optional)
- [ ] Create loading spinners for async operations
- [ ] Show progress bar for large files
- [ ] Add skeleton screens during loading
- [ ] Implement global keyboard shortcuts handler
- [ ] Create keyboard shortcuts help modal (Ctrl+?)
- [ ] Document all shortcuts in help
- [ ] Add ARIA labels for accessibility
- [ ] Ensure keyboard navigation works
- [ ] Add focus indicators
- [ ] Optimize large file rendering
- [ ] Debounce/throttle expensive operations
- [ ] Lazy load heavy components

#### Components to Build
- `ErrorBoundary.tsx` - React error handler
- `Loading.tsx` - Loading states
- `KeyboardHelp.tsx` - Shortcuts modal

#### Keyboard Shortcuts
- `Ctrl/Cmd + O` - Open file
- `Ctrl/Cmd + S` - Save file
- `Ctrl/Cmd + Shift + S` - Toggle source view
- `Ctrl/Cmd + E` - Toggle edit mode
- `Ctrl/Cmd + ,` - Settings
- `Ctrl/Cmd + T` - Toggle theme
- `Ctrl/Cmd + ?` - Keyboard help
- `Ctrl/Cmd + R` - Reload file

#### Deliverables
- Polished error handling
- Smooth loading states
- Comprehensive keyboard shortcuts
- Basic accessibility compliance

---

### **Phase 10: GitHub Actions CI/CD** 🚀
**Version:** 0.1.0  
**Timeline:** 2 hours  
**Priority:** HIGH

#### Tasks
- [ ] Create `.github/workflows/build.yml`
- [ ] Create `.github/workflows/release.yml`
- [ ] Set up matrix for macOS/Windows/Linux builds
- [ ] Configure Node.js setup action
- [ ] Add dependency caching
- [ ] Run ESLint in CI
- [ ] Run Vitest unit tests
- [ ] Run Playwright E2E tests
- [ ] Build with electron-builder
- [ ] Upload build artifacts
- [ ] Create manual release trigger (workflow_dispatch)
- [ ] Add version input to release workflow
- [ ] Auto-update package.json version
- [ ] Generate checksums for binaries
- [ ] Create GitHub release with notes
- [ ] Upload all platform binaries to release
- [ ] Auto-generate changelog from commits
- [ ] Tag release with version (v0.1.0)

#### Workflow Files
```
.github/
├── workflows/
│   ├── build.yml       # CI on push
│   ├── release.yml     # Manual release
│   └── test.yml        # Test-only workflow
```

#### GitHub Secrets Required
- `GITHUB_TOKEN` (auto-provided)
- (Optional) Code signing certificates

#### Deliverables
- CI runs on every push
- Manual release workflow functional
- Binaries for macOS/Windows/Linux
- GitHub releases with changelogs

---

### **Phase 11: Packaging & Distribution** 📦
**Version:** 0.1.0  
**Timeline:** 1 hour  
**Priority:** HIGH

#### Tasks
- [ ] Create `electron-builder.yml`
- [ ] Configure app metadata (name, ID, description)
- [ ] Set up file associations in config
- [ ] Configure macOS build (DMG, zip)
- [ ] Configure Windows build (NSIS, portable)
- [ ] Configure Linux build (AppImage, deb, rpm)
- [ ] Create platform icons (icns, ico, png)
- [ ] Set up macOS entitlements
- [ ] Test macOS build on Intel
- [ ] Test macOS build on Apple Silicon
- [ ] Test Windows build on Win10/11
- [ ] Test Linux build on Ubuntu
- [ ] Verify file associations on all platforms
- [ ] Test installers on each platform
- [ ] Create installation instructions

#### Build Targets
- **macOS:** DMG, zip (universal or separate Intel/Apple Silicon)
- **Windows:** NSIS installer, portable exe
- **Linux:** AppImage, deb, rpm

#### Deliverables
- electron-builder configuration complete
- Builds successful on all platforms
- Installers tested and working
- File associations functional

---

### **Phase 12: Documentation** 📚
**Version:** 0.1.0  
**Timeline:** 1 hour  
**Priority:** MEDIUM

#### Tasks
- [ ] Write comprehensive README.md
- [ ] Add project description and features
- [ ] Include screenshots/demo GIF
- [ ] Document installation instructions
- [ ] Add build from source guide
- [ ] Create usage guide
- [ ] Document keyboard shortcuts
- [ ] Add contributing guidelines
- [ ] Create AGENTS.md for AI assistants
- [ ] Document build commands
- [ ] Document test commands
- [ ] Outline code style guidelines
- [ ] Create CHANGELOG.md
- [ ] Document v0.1.0 features
- [ ] Create GitHub issue templates
- [ ] Create pull request template
- [ ] Add LICENSE file
- [ ] Update package.json metadata

#### Documentation Files
- `README.md` - User-facing documentation
- `AGENTS.md` - AI assistant guidelines
- `CHANGELOG.md` - Version history
- `CONTRIBUTING.md` - Contribution guide
- `LICENSE` - MIT License

#### Deliverables
- Complete, professional documentation
- Easy onboarding for new users/contributors
- Clear build and development instructions

---

## 🎯 Version Milestones

### **v0.1.0 - MVP Release** (Current Target)
**Target Date:** TBD  
**Focus:** Core functionality + CI/CD

**Features:**
- ✅ Markdown rendering with syntax highlighting
- ✅ Light/Dark themes
- ✅ File association (.md files)
- ✅ Source view mode
- ✅ Edit mode with live preview
- ✅ File operations (open, save, recent)
- ✅ Settings persistence
- ✅ Multi-platform packaging (macOS/Windows/Linux)
- ✅ Automated GitHub releases
- ✅ Unit and E2E tests

**Excluded (deferred to v0.2.0+):**
- ❌ Multi-tab support
- ❌ Auto-update functionality
- ❌ Export to PDF/HTML
- ❌ Code signing
- ❌ Plugin system

---

### **v0.2.0 - Enhanced Features**
**Target Date:** TBD  
**Focus:** User experience improvements

**Planned Features:**
- Multi-tab support (open multiple files)
- Export to PDF/HTML
- Custom markdown templates
- Find/Replace in editor
- Table of contents navigation
- Vim mode for editor (optional)
- Configurable toolbar
- Advanced syntax highlighting themes
- Markdown snippets/shortcuts

---

### **v0.3.0 - Advanced Features**
**Target Date:** TBD  
**Focus:** Advanced functionality

**Planned Features:**
- Auto-update with electron-updater
- Plugin/extension system
- Cloud sync integration (optional)
- Collaborative editing (websocket)
- Git integration
- Markdown linting
- Spell checker
- Custom CSS themes marketplace
- Presentation mode

---

### **v1.0.0 - Production Release**
**Target Date:** TBD  
**Focus:** Stability + Polish

**Requirements:**
- Code signing for all platforms
- Comprehensive documentation
- 90%+ test coverage
- Accessibility audit passed
- Security audit passed
- Performance optimizations
- Localization support (i18n)
- Beta testing completed
- Community feedback incorporated

---

## 📊 Progress Tracking

### **Current Status**
- **Phase:** 0 (Preparation)
- **Version:** 0.0.0
- **Progress:** 0% (0/12 phases complete)

### **Completion Checklist**
- [ ] Phase 0: Preparation
- [ ] Phase 1: Foundation Setup
- [ ] Phase 2: Core Markdown Rendering
- [ ] Phase 3: File Association
- [ ] Phase 4: Source View Mode
- [ ] Phase 5: Edit Mode
- [ ] Phase 6: File Operations
- [ ] Phase 7: Settings & Preferences
- [ ] Phase 8: Testing Infrastructure
- [ ] Phase 9: Polish & UX
- [ ] Phase 10: GitHub Actions CI/CD
- [ ] Phase 11: Packaging & Distribution
- [ ] Phase 12: Documentation

---

## 🛠️ Technical Decisions

### **Architecture Choices**

#### **Why Vite over Webpack?**
- 10-100x faster HMR during development
- Simpler configuration
- Native ESM support
- Built-in TypeScript support
- Smaller bundle sizes

#### **Why React over Vue/Svelte?**
- Larger ecosystem and community
- Better TypeScript integration
- More component libraries available
- Developer familiarity

#### **Why `marked` over `showdown`?**
- 3x faster parsing
- Actively maintained
- Smaller bundle size
- Better security
- More extensible

#### **Why CodeMirror 6 over Monaco?**
- Lighter weight (~100KB vs ~3MB)
- Better Electron integration
- Modern architecture
- Extensible plugin system
- Better mobile support

### **Security Improvements**

**Legacy Issues (v13):**
- ❌ `nodeIntegration: true` (security risk)
- ❌ No context isolation
- ❌ Direct DOM manipulation
- ❌ No input sanitization

**Modern Security (v40):**
- ✅ `contextIsolation: true`
- ✅ `nodeIntegration: false`
- ✅ Preload script with explicit IPC channels
- ✅ CSP headers for renderer
- ✅ DOMPurify for XSS protection
- ✅ Input validation throughout

---

## 📝 Notes & Considerations

### **Development Environment**
- Node.js 20+ required
- npm or yarn package manager
- Git for version control
- macOS/Windows/Linux for platform testing

### **Known Limitations (v0.1.0)**
- Single file mode only (no tabs)
- No auto-update (manual downloads)
- No code signing (unsigned binaries)
- No plugin system
- No export to PDF/HTML
- English UI only (no i18n)

### **Future Considerations**
- Electron Forge migration (alternative to electron-builder)
- Tauri port (smaller binary sizes)
- Web version (PWA)
- Mobile apps (React Native)
- Browser extension

---

## 🤝 Contributing

This roadmap is a living document. Suggestions and contributions are welcome!

### **How to Suggest Changes**
1. Open an issue with the `roadmap` label
2. Describe the proposed change
3. Explain the rationale
4. Wait for maintainer review

### **Priority Levels**
- **HIGH:** Critical for MVP, blocking other work
- **MEDIUM:** Important but not blocking
- **LOW:** Nice to have, future enhancement

---

## 📄 License

This project will be released under the **MIT License**.

---

**Last Updated:** 2026-02-04  
**Maintained By:** @phenixcoder  
**Repository:** https://github.com/phenixcoder/markdown
