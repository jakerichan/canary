import { useState, useEffect } from 'react'

type Position = { x: number, y: number }

const useDrag = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  const [position, setPosition] = useState<Position | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    // Don't start dragging if clicking on a button
    if ((e.target as HTMLElement).closest('button')) {
      return
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const offsetX = e.clientX - rect.left
      const offsetY = e.clientY - rect.top

      // Initialize position if not set
      if (position === null) {
        setPosition({
          x: rect.left,
          y: rect.top,
        })
      }

      setDragOffset({
        x: offsetX,
        y: offsetY,
      })
      setIsDragging(true)
    }
  }

  return {
    position,
    handlers: {
      onMouseDown: handleHeaderMouseDown,
    },
  }
}

export default useDrag
