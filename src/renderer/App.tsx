import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-8">Markdown Viewer</h1>
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => setCount(count + 1)}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          Count: {count}
        </button>
        <p className="text-sm text-gray-500">
          Project initialized with Vite + React + TypeScript + Electron
        </p>
      </div>
    </div>
  )
}

export default App
