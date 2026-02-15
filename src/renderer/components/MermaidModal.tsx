import { useEffect, useRef, useState, useCallback } from 'react'
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface MermaidModalProps {
  svgContent: string
  onClose: () => void
  isDarkMode: boolean
}

export default function MermaidModal({ svgContent, onClose, isDarkMode }: MermaidModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale(prev => Math.min(Math.max(0.1, prev + delta), 10))
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 10))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.1))
  const resetView = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const displayPercent = Math.round(scale * 100)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className="absolute top-4 right-4 flex items-center gap-2 z-10"
        onClick={e => e.stopPropagation()}
      >
        <div
          className={`flex items-center gap-1 rounded-lg px-2 py-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          <button
            onClick={zoomOut}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span
            className={`px-2 min-w-[4rem] text-center text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
          >
            {displayPercent}%
          </span>
          <button
            onClick={zoomIn}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={resetView}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
            title="Reset view"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={onClose}
          className={`p-2 rounded-lg shadow-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'}`}
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
        onClick={e => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          <div
            className={`p-8 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>
      </div>

      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'} shadow-lg`}
      >
        Scroll to zoom • Drag to pan • Esc to close
      </div>
    </div>
  )
}
