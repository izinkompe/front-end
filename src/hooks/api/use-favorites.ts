'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { apiClient } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { FarmerStoreProfileSchema } from '@/types/api/farmers'
import { OfferSchema, type Offer } from '@/types/api/offers'
import { BookmarkListSchema, type CreateBookmarkListRequest, type User } from '@/types/api/auth'
import { useCurrentUser } from './use-auth'

const FavoritesSchema = z.object({
  offers: z.array(OfferSchema),
  farmers: z.array(FarmerStoreProfileSchema),
})

export const HydratedBookmarkListSchema = BookmarkListSchema.extend({
  offers: z.array(OfferSchema),
})
export type HydratedBookmarkList = z.infer<typeof HydratedBookmarkListSchema>

const BookmarkListsResponseSchema = z.object({
  lists: z.array(HydratedBookmarkListSchema),
})

export function useFavorites() {
  const { data: user } = useCurrentUser()
  return useQuery({
    queryKey: [...queryKeys.favorites, user?.id],
    queryFn: () => apiClient('/api/favorites', FavoritesSchema),
    enabled: user?.role === 'buyer',
  })
}

export function useBookmarkLists() {
  const { data: user } = useCurrentUser()
  return useQuery({
    queryKey: [...queryKeys.favoriteLists, user?.id],
    queryFn: () => apiClient('/api/favorites/lists', BookmarkListsResponseSchema),
    enabled: user?.role === 'buyer',
  })
}

export function useCreateBookmarkList() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateBookmarkListRequest) =>
      apiClient('/api/favorites/lists', HydratedBookmarkListSchema, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.favoriteLists }),
  })
}

export function useDeleteBookmarkList() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (listId: string) =>
      apiClient(
        '/api/favorites/lists/' + encodeURIComponent(listId),
        z.object({ deletedId: z.string() }),
        {
          method: 'DELETE',
        }
      ),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.favoriteLists }),
  })
}

export function useToggleBookmarkListOffer() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ listId, offerId }: { listId: string; offerId: string }) =>
      apiClient(
        '/api/favorites/lists/' +
          encodeURIComponent(listId) +
          '/offers/' +
          encodeURIComponent(offerId) +
          '/toggle',
        z.object({ listId: z.string(), offerIds: z.array(z.string()) }),
        { method: 'POST' }
      ),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.favoriteLists }),
  })
}

export function useToggleFavoriteOffer() {
  const client = useQueryClient()
  const { data: user } = useCurrentUser()
  return useMutation({
    mutationFn: (offerId: string) =>
      apiClient(
        '/api/favorites/offers/' + encodeURIComponent(offerId) + '/toggle',
        z.object({ favoriteOfferIds: z.array(z.string()) }),
        { method: 'POST' }
      ),
    onSuccess: ({ favoriteOfferIds }) => {
      client.setQueryData<User | null>(queryKeys.auth.me, (current) =>
        current && current.id === user?.id ? { ...current, favoriteOfferIds } : current
      )
      return client.invalidateQueries({ queryKey: queryKeys.favorites })
    },
  })
}

export function useOfferFavorites(onSignIn: () => void, announce: (message: string) => void) {
  const { data: user } = useCurrentUser()
  const toggle = useToggleFavoriteOffer()

  function toggleFavorite(offer: Offer) {
    if (user?.role !== 'buyer') {
      onSignIn()
      return
    }
    if (toggle.isPending) return
    toggle.mutate(offer.id, {
      onSuccess: ({ favoriteOfferIds }) =>
        announce(
          favoriteOfferIds.includes(offer.id)
            ? offer.commodityName + ' disimpan ke favorit.'
            : offer.commodityName + ' dihapus dari favorit.'
        ),
      onError: () => announce('Favorit gagal diubah. Coba lagi.'),
    })
  }

  return {
    favoriteIds: new Set(user?.role === 'buyer' ? user.favoriteOfferIds : []),
    toggleFavorite,
  }
}
