import { useState, useEffect } from 'react'

type Size = { width: number, height: number }

const useResize = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  const [size, setSize] = useState<Size | null>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y

      setSize({
        width: Math.max(200, resizeStart.width + deltaX), // min-width: 300px
        height: Math.max(100, resizeStart.height + deltaY), // min-height: 200px
      })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizeStart])

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()

      // Initialize size if not set
      if (size === null) {
        setSize({
          width: rect.width,
          height: rect.height,
        })
      }

      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: size?.width ?? rect.width,
        height: size?.height ?? rect.height,
      })
      setIsResizing(true)
    }
  }

  return {
    size,
    handlers: {
      onMouseDown: handleResizeMouseDown,
    },
  }
}

export default useResize
