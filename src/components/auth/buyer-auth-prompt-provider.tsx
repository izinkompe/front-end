'use client'

import { createContext, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { BuyerAuthDialog } from '@/components/auth/buyer-auth-dialog'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { useHydrated } from '@/hooks/use-hydrated'

interface BuyerAuthPromptContextValue {
  isAuthenticated: boolean
  openAuthForRoute: (href: string) => void
}

export const BuyerAuthPromptContext = createContext<BuyerAuthPromptContextValue | null>(null)

export function BuyerAuthPromptProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const isHydrated = useHydrated()
  const { data: currentUser } = useCurrentUser()
  const [authOpen, setAuthOpen] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  const isAuthenticated = Boolean(isHydrated && currentUser)

  function openAuthForRoute(href: string) {
    setPendingHref(href)
    setAuthOpen(true)
  }

  return (
    <BuyerAuthPromptContext.Provider value={{ isAuthenticated, openAuthForRoute }}>
      {children}
      {authOpen && (
        <BuyerAuthDialog
          open={authOpen}
          onOpenChange={(nextOpen) => {
            setAuthOpen(nextOpen)
            if (!nextOpen) setPendingHref(null)
          }}
          onAuthenticated={() => {
            const target = pendingHref
            setPendingHref(null)
            if (target?.startsWith('/akun')) {
              router.push(target)
            }
          }}
        />
      )}
    </BuyerAuthPromptContext.Provider>
  )
}
