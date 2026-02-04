# Markdown Viewer

Modern Electron-based markdown viewer built with React, TypeScript, and TailwindCSS.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🎨 **GitHub-style rendering** - Beautiful markdown preview with syntax highlighting
- 🌓 **Dark mode** - Automatic system preference detection
- ⚡ **Fast & Modern** - Built with Vite + React + TypeScript
- 🔒 **Secure** - Context isolation, XSS protection with DOMPurify
- 📝 **GFM Support** - GitHub Flavored Markdown with tables, task lists, etc.
- 💻 **Code highlighting** - Syntax highlighting for 100+ languages

## 🚀 Quick Start

### Prerequisites

- Node.js 22+ (or 20.19.0+)
- npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/phenixcoder/markdown.git
cd markdown

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Usage

#### Running in WSL2 (Windows Subsystem for Linux)

Since this is an Electron app running in WSL2, you have two options:

**Option 1: Access via Browser** (Recommended for WSL2)
```bash
# Start the dev server
npm run dev

# Open in Windows browser: http://localhost:5173
# Note: Electron GUI won't show in WSL2, but Vite dev server works
```

**Option 2: Run from Windows**
```bash
# From Windows PowerShell/CMD, navigate to the WSL path:
cd \\wsl$\Ubuntu\home\balwant\kitchen-sink\phenixcoder\markdown
npm run dev
```

#### Open a file via dialog:
```bash
npm run dev
```
Then click "Open File" button or use the keyboard shortcut.

#### Open a specific file from command line:
```bash
npm run dev -- path/to/your/file.md
```

#### Examples:
```bash
# Open the sample file
npm run dev -- tests/fixtures/sample.md

# Open your README
npm run dev -- README.md

# Open any markdown file
npm run dev -- /absolute/path/to/document.md
```

## 🏗️ Development

### Project Structure

```
markdown/
├── src/
│   ├── main/               # Electron main process
│   │   ├── index.ts        # Main entry, file handling
│   │   └── preload.ts      # IPC bridge
│   ├── renderer/           # React app
│   │   ├── App.tsx         # Main component
│   │   ├── components/     # React components
│   │   ├── utils/          # Utilities (markdown parser)
│   │   └── styles/         # CSS files
│   └── types/              # TypeScript definitions
├── tests/
│   ├── unit/               # Unit tests
│   ├── e2e/                # E2E tests
│   └── fixtures/           # Test files
└── .github/workflows/      # CI/CD pipelines
```

### Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm test             # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:e2e     # Run E2E tests
npm run electron:build  # Build Electron app with electron-builder
```

### Tech Stack

- **Electron 32** - Desktop framework
- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool with HMR
- **TailwindCSS 3** - Styling
- **marked** - Markdown parser
- **highlight.js** - Syntax highlighting
- **DOMPurify** - XSS protection

## 📦 Building for Production

### Build for all platforms:
```bash
npm run electron:build
```

This will create distributable files in the `release/` directory for:
- **macOS**: `.dmg` and `.zip`
- **Windows**: `.exe` (installer) and portable
- **Linux**: `.AppImage`, `.deb`, `.rpm`

### Platform-specific builds:
```bash
# Build for current platform only
npm run electron:build -- --mac
npm run electron:build -- --win
npm run electron:build -- --linux
```

## 🚀 Releases

Releases are automated via GitHub Actions. To create a new release:

1. Go to **Actions** tab on GitHub
2. Select **Release** workflow
3. Click **Run workflow**
4. Enter version number (e.g., `0.1.0`)
5. Binaries will be built and attached to the GitHub release

## 🗺️ Roadmap

See [ROADMAP.md](ROADMAP.md) for the complete development plan.

### Current Status (v0.1.0-alpha)
- ✅ Core markdown rendering
- ✅ File operations (open, command-line)
- ✅ Dark mode support
- ✅ CI/CD pipelines
- 🚧 Source view mode (planned)
- 🚧 Edit mode (planned)
- 🚧 File association (planned)

## 🤝 Contributing

Contributions are welcome! Please see our development workflow:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🔗 Links

- **Repository**: https://github.com/phenixcoder/markdown
- **Issues**: https://github.com/phenixcoder/markdown/issues
- **Legacy code**: https://github.com/phenixcoder/markdown/tree/legacy

## 🙏 Acknowledgments

- [marked](https://marked.js.org/) - Markdown parser
- [highlight.js](https://highlightjs.org/) - Syntax highlighting
- [GitHub Markdown CSS](https://github.com/sindresorhus/github-markdown-css) - Styling inspiration

---

**Built with ❤️ by [Balwant Singh](https://github.com/phenixcoder)**
