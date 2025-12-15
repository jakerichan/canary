import { useState, useEffect } from 'react'

type Position = { x: number, y: number }

const useDrag = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  savePosition?: boolean,
) => {
  const [position, setPosition] = useState<Position | null>(() => {
    if (savePosition) {
      const savedPosition = localStorage.getItem('canary-ui-position')
      try {
        return savedPosition ? JSON.parse(savedPosition) : null
      }
      catch (error) {
        console.error('Error parsing canary-ui-position', error)
        return null
      }
    }
    return null
  })
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
      if (savePosition) {
        localStorage.setItem('canary-ui-position', JSON.stringify(position))
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, savePosition, position])

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
