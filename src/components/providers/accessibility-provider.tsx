'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { z } from 'zod'
import { readLocalValue, writeLocalValue } from '@/lib/data/browser-storage'

const storageKey = 'pangantani:accessibility'
const TextScaleSchema = z.enum(['default', 'large', 'xlarge'])
const PreferencesSchema = z.object({ highContrast: z.boolean(), textScale: TextScaleSchema })
export type TextScale = z.infer<typeof TextScaleSchema>
type AccessibilityPreferences = z.infer<typeof PreferencesSchema>

const defaults: AccessibilityPreferences = { highContrast: false, textScale: 'default' }
const AccessibilityContext = createContext<{
  preferences: AccessibilityPreferences
  update: (preferences: Partial<AccessibilityPreferences>) => void
} | null>(null)

function applyAccessibility(preferences: AccessibilityPreferences) {
  document.documentElement.classList.toggle('high-contrast', preferences.highContrast)
  document.documentElement.dataset.textScale = preferences.textScale
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(defaults)

  useEffect(() => {
    const restore = () => {
      const stored = PreferencesSchema.safeParse(readLocalValue(storageKey))
      const restored = stored.data ?? defaults
      applyAccessibility(restored)
      setPreferences(restored)
    }
    restore()
    const sync = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) restore()
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  function update(changes: Partial<AccessibilityPreferences>) {
    const next = { ...preferences, ...changes }
    applyAccessibility(next)
    writeLocalValue(storageKey, next)
    setPreferences(next)
  }

  return (
    <AccessibilityContext.Provider value={{ preferences, update }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) throw new Error('AccessibilityProvider is required')
  return context
}
