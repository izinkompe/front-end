'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { FavoritesSidebar } from './favorites-sidebar'

interface FavoritesSidebarContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  openFavorites: () => void
  closeFavorites: () => void
}

const FavoritesSidebarContext = createContext<FavoritesSidebarContextValue | null>(null)

export function FavoritesSidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  const value = useMemo<FavoritesSidebarContextValue>(
    () => ({
      open,
      setOpen,
      openFavorites: () => setOpen(true),
      closeFavorites: () => setOpen(false),
    }),
    [open]
  )

  return (
    <FavoritesSidebarContext.Provider value={value}>
      {children}
      <FavoritesSidebar open={open} onOpenChange={setOpen} />
    </FavoritesSidebarContext.Provider>
  )
}

export function useFavoritesSidebar() {
  const context = useContext(FavoritesSidebarContext)
  if (!context) {
    throw new Error('useFavoritesSidebar must be used within FavoritesSidebarProvider')
  }
  return context
}
