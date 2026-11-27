'use client'

import { useEffect } from 'react'
import { useAccessibilityStore } from '@/stores/use-accessibility-store'

export function StoreSyncEffect() {
  const highContrast = useAccessibilityStore((state) => state.highContrast)
  const textScale = useAccessibilityStore((state) => state.textScale)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('high-contrast', highContrast)
    root.style.setProperty('--text-scale', String(textScale))
  }, [highContrast, textScale])

  return null
}
