import { useState, useEffect } from 'react'

type Size = { width: number, height: number }

const useResize = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  saveSize?: boolean,
) => {
  const [size, setSize] = useState<Size | null>(() => {
    if (saveSize) {
      const savedSize = localStorage.getItem('canary-ui-size')
      try {
        return savedSize ? JSON.parse(savedSize) : null
      }
      catch (error) {
        console.error('Error parsing canary-ui-size', error)
        return null
      }
    }
    return null
  })
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
        width: Math.max(200, resizeStart.width + deltaX),
        height: Math.max(100, resizeStart.height + deltaY),
      })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      if (saveSize) {
        localStorage.setItem('canary-ui-size', JSON.stringify(size))
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizeStart, saveSize, size])

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
