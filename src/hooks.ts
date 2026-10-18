import { useEffect, useRef, useState, type MouseEvent, type PointerEvent, type TouchEvent } from 'react'

/** Długie przytrzymanie (500 ms) + zwykłe kliknięcie, bez wywołania kliknięcia po przytrzymaniu. */
export function useLongPress(onLong?: () => void, onClick?: () => void, ms = 500) {
  const timer = useRef<number | undefined>(undefined)
  const start = useRef<{ x: number; y: number } | null>(null)
  const fired = useRef(false)

  const clear = () => {
    window.clearTimeout(timer.current)
    start.current = null
  }

  return {
    onPointerDown(e: PointerEvent) {
      fired.current = false
      if (!onLong || e.button !== 0) return
      start.current = { x: e.clientX, y: e.clientY }
      timer.current = window.setTimeout(() => {
        fired.current = true
        navigator.vibrate?.(15)
        onLong()
      }, ms)
    },
    onPointerMove(e: PointerEvent) {
      if (start.current && Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 10) clear()
    },
    onPointerUp: clear,
    onPointerCancel: clear,
    onPointerLeave: clear,
    onContextMenu(e: MouseEvent) {
      if (onLong) e.preventDefault()
    },
    onClick(e: MouseEvent) {
      if (fired.current) {
        fired.current = false
        e.preventDefault()
        return
      }
      onClick?.()
    },
  }
}

/** Przesunięcie palcem w poziomie. */
export function useSwipe(onLeft: () => void, onRight: () => void) {
  const s = useRef<{ x: number; y: number } | null>(null)
  return {
    onTouchStart(e: TouchEvent) {
      const t = e.touches[0]
      s.current = { x: t.clientX, y: t.clientY }
    },
    onTouchEnd(e: TouchEvent) {
      if (!s.current) return
      const t = e.changedTouches[0]
      const dx = t.clientX - s.current.x
      const dy = t.clientY - s.current.y
      s.current = null
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? onLeft : onRight)()
    },
  }
}

/** Aktualny czas odświeżany co `ms` i po powrocie do aplikacji. */
export function useTeraz(ms: number) {
  const [teraz, setTeraz] = useState(() => new Date())
  useEffect(() => {
    const tick = () => setTeraz(new Date())
    const id = window.setInterval(tick, ms)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [ms])
  return teraz
}
