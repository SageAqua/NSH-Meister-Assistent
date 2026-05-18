export function haptic(pattern: number | number[] = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try { navigator.vibrate(pattern) } catch {}
  }
}

export function hapticLight() { haptic(6) }
export function hapticMedium() { haptic(12) }
export function hapticSuccess() { haptic([8, 40, 8]) }
