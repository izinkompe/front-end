import { z } from 'zod'
import { readLocalValue, writeLocalValue } from '@/lib/data/browser-storage'
import { DEFAULT_ACCOUNT_PREFERENCES } from '@/lib/data/profile-helpers'
import { AccountPreferencesSchema, BookmarkListSchema, type User } from '@/types/api/auth'

const PreferencesStateSchema = z.object({
  favoriteOfferIds: z.array(z.string()).optional(),
  followedFarmerIds: z.array(z.string()).optional(),
  bookmarkLists: z.array(BookmarkListSchema).optional(),
  preferences: AccountPreferencesSchema.optional(),
})

function storageKey(user: User) {
  return 'pangantani:buyer-preferences:' + user.id
}

export function getBuyerPreferences(user: User) {
  const local = PreferencesStateSchema.safeParse(readLocalValue(storageKey(user)))
  return {
    favoriteOfferIds: local.data?.favoriteOfferIds ?? user.favoriteOfferIds ?? [],
    followedFarmerIds: local.data?.followedFarmerIds ?? user.followedFarmerIds ?? [],
    bookmarkLists: local.data?.bookmarkLists ?? user.bookmarkLists ?? [],
    preferences: local.data?.preferences ?? user.preferences ?? DEFAULT_ACCOUNT_PREFERENCES,
  }
}

export function saveBuyerPreferences(user: User) {
  writeLocalValue(storageKey(user), {
    favoriteOfferIds: user.favoriteOfferIds,
    followedFarmerIds: user.followedFarmerIds,
    bookmarkLists: user.bookmarkLists,
    preferences: user.preferences,
  })
}
