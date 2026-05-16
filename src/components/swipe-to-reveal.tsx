"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

const BTN_W = 76

interface SwipeToRevealProps {
  onDelete?: () => void
  onEdit?: () => void
  children: React.ReactNode
  className?: string
}

export function SwipeToReveal({ onDelete, onEdit, children, className }: SwipeToRevealProps) {
  const [offset, setOffset] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const dir = useRef<"h" | "v" | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalW = (onEdit ? BTN_W : 0) + (onDelete ? BTN_W : 0)
  const isOpen = offset < -totalW / 3

  // Close when tapping outside
  useEffect(() => {
    if (!isOpen) return
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        snap(0)
      }
    }
    document.addEventListener("mousedown", handleOutside)
    document.addEventListener("touchstart", handleOutside)
    return () => {
      document.removeEventListener("mousedown", handleOutside)
      document.removeEventListener("touchstart", handleOutside)
    }
  }, [isOpen])

  function snap(target: number) {
    setTransitioning(true)
    setOffset(target)
    setTimeout(() => setTransitioning(false), 260)
  }

  function close() { snap(0) }

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    dir.current = null
  }

  function onTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - startX.current
    const dy = e.touches[0].clientY - startY.current
    if (!dir.current) {
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return
      dir.current = Math.abs(dx) > Math.abs(dy) ? "h" : "v"
    }
    if (dir.current === "v") return
    const base = isOpen ? -totalW : 0
    setOffset(Math.max(-totalW, Math.min(0, base + dx)))
  }

  function onTouchEnd() {
    if (dir.current !== "h") return
    snap(offset < -totalW * 0.35 ? -totalW : 0)
  }

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Action buttons revealed on swipe */}
      <div className="absolute inset-y-0 right-0 flex" style={{ width: totalW }}>
        {onEdit && (
          <button
            onClick={() => { close(); onEdit() }}
            className="flex w-[76px] flex-col items-center justify-center gap-0.5 bg-blue-500 text-white active:bg-blue-700"
          >
            <span className="text-xl">✏️</span>
            <span className="text-xs font-semibold">Ändern</span>
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => { close(); onDelete() }}
            className="flex w-[76px] flex-col items-center justify-center gap-0.5 bg-red-500 text-white active:bg-red-700"
          >
            <span className="text-xl">🗑️</span>
            <span className="text-xs font-semibold">Löschen</span>
          </button>
        )}
      </div>

      {/* Swipeable content layer */}
      <div
        style={{
          transform: `translateX(${offset}px)`,
          transition: transitioning ? "transform 0.25s ease" : "none",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
