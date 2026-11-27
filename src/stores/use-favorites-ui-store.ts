'use client'

import { create } from 'zustand'

interface FavoritesUiState {
  isOpen: boolean
  activeListId: string | null
  openSidebar: (listId?: string | null) => void
  closeSidebar: () => void
  setActiveListId: (listId: string | null) => void
}

export const useFavoritesUiStore = create<FavoritesUiState>()((set) => ({
  isOpen: false,
  activeListId: null,
  openSidebar: (listId = null) => set({ isOpen: true, activeListId: listId }),
  closeSidebar: () => set({ isOpen: false }),
  setActiveListId: (activeListId) => set({ activeListId }),
}))
