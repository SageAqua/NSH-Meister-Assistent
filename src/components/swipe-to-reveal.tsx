"use client"

import { useEffect, useRef, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

const MIN_ACTION_W = 56
const MAX_ACTION_W = 76

interface SwipeToRevealProps {
  onDelete?: () => void
  onEdit?: () => void
  children: React.ReactNode
  className?: string
}

export function SwipeToReveal({ onDelete, onEdit, children, className }: SwipeToRevealProps) {
  const [offset, setOffset] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const startX = useRef(0)
  const startY = useRef(0)
  const startOffset = useRef(0)
  const dir = useRef<"h" | "v" | null>(null)
  const pointerId = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const actionCount = Number(Boolean(onEdit)) + Number(Boolean(onDelete))
  const actionWidth =
    containerWidth > 0 && actionCount > 0
      ? Math.max(MIN_ACTION_W, Math.min(MAX_ACTION_W, containerWidth * 0.19))
      : MAX_ACTION_W
  const totalW = actionCount * actionWidth
  const isOpen = totalW > 0 && offset < -totalW / 3

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

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    setContainerWidth(node.clientWidth)
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  function snap(target: number) {
    setTransitioning(true)
    setOffset(target)
    window.setTimeout(() => setTransitioning(false), 260)
  }

  function close() {
    snap(0)
  }

  function open() {
    if (totalW > 0) snap(-totalW)
  }

  function finishDrag() {
    if (dir.current !== "h") return
    snap(offset < -totalW * 0.35 ? -totalW : 0)
  }

  function beginDrag(clientX: number, clientY: number) {
    startX.current = clientX
    startY.current = clientY
    startOffset.current = isOpen ? -totalW : 0
    dir.current = null
  }

  function moveDrag(clientX: number, clientY: number) {
    const dx = clientX - startX.current
    const dy = clientY - startY.current
    if (!dir.current) {
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return
      dir.current = Math.abs(dx) > Math.abs(dy) ? "h" : "v"
    }
    if (dir.current === "v") return
    setOffset(Math.max(-totalW, Math.min(0, startOffset.current + dx)))
  }

  function onTouchStart(e: React.TouchEvent) {
    beginDrag(e.touches[0].clientX, e.touches[0].clientY)
  }

  function onTouchMove(e: React.TouchEvent) {
    moveDrag(e.touches[0].clientX, e.touches[0].clientY)
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch") return
    pointerId.current = e.pointerId
    beginDrag(e.clientX, e.clientY)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (pointerId.current !== e.pointerId) return
    moveDrag(e.clientX, e.clientY)
  }

  function onPointerEnd(e: React.PointerEvent<HTMLDivElement>) {
    if (pointerId.current !== e.pointerId) return
    pointerId.current = null
    finishDrag()
  }

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-y-0 right-0 z-0 flex" style={{ width: totalW }}>
        {onEdit && (
          <button
            type="button"
            aria-label="Termin aendern"
            onClick={() => {
              close()
              onEdit()
            }}
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 bg-blue-500 px-1 text-white active:bg-blue-700"
          >
            <Pencil className="size-4" />
            <span className="nsh-i18n nsh-i18n-center text-[11px] font-semibold leading-tight" data-sq="Ndrysho">
              Ändern
            </span>
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            aria-label="Termin loeschen"
            onClick={() => {
              close()
              onDelete()
            }}
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 bg-red-500 px-1 text-white active:bg-red-700"
          >
            <Trash2 className="size-4" />
            <span className="nsh-i18n nsh-i18n-center text-[11px] font-semibold leading-tight" data-sq="Fshi">
              Löschen
            </span>
          </button>
        )}
      </div>

      <div
        className="relative z-10"
        style={{
          transform: `translateX(${offset}px)`,
          transition: transitioning ? "transform 0.25s ease" : "none",
          touchAction: "pan-y",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={finishDrag}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onDoubleClick={isOpen ? close : open}
      >
        {children}
      </div>
    </div>
  )
}
