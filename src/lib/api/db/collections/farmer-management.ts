import { createCollection, localOnlyCollectionOptions } from '@tanstack/react-db'
import type { User } from '@/types/api/auth'
import {
  FarmerFarmSchema,
  FarmerStoreSettingsSchema,
  type FarmerFarm,
  type FarmerStoreSettings,
} from '@/types/api/farmer-management'
import { mockUsersData } from '../fixtures/users.fixture'
import { mockFarmerStoreMeta } from '../fixtures/farmer-stores.fixture'

function buildStoreSettings(farmer: User): FarmerStoreSettings {
  const meta = mockFarmerStoreMeta[farmer.id]
  return {
    farmerId: farmer.id,
    storeName: (farmer.organization ?? '').trim() || farmer.name,
    description:
      meta?.description ??
      `${farmer.organization ?? farmer.name} menyalurkan hasil panen dari kebun.`,
    publicPickupNotes:
      meta?.publicPickupNotes ?? 'Pengambilan mandiri mengikuti jadwal pada setiap penawaran.',
    primaryCommodities: farmer.primaryCommodities ?? [],
    featuredOfferIds: [],
    updatedAt: farmer.updatedAt,
  }
}

function buildFarms(farmer: User): FarmerFarm[] {
  const addresses = farmer.addresses ?? []
  return addresses.map((address, index) => ({
    id: `farm-${farmer.id}-${address.id || index + 1}`,
    farmerId: farmer.id,
    name: address.label || farmer.organization || 'Kebun utama',
    areaName: address.areaName,
    fullAddress: address.fullAddress,
    latitude: address.latitude,
    longitude: address.longitude,
    primaryCommodities: farmer.primaryCommodities ?? [],
    pickupNotes: address.notes,
    status: 'active',
    createdAt: farmer.createdAt,
    updatedAt: farmer.updatedAt,
  }))
}

const farmerUsers = mockUsersData.filter((user) => user.role === 'farmer')

export const farmerStoreSettingsCollection = createCollection(
  localOnlyCollectionOptions({
    id: 'farmer-store-settings',
    schema: FarmerStoreSettingsSchema,
    getKey: (item) => item.farmerId,
    initialData: farmerUsers.map(buildStoreSettings),
  })
)

export const farmerFarmsCollection = createCollection(
  localOnlyCollectionOptions({
    id: 'farmer-farms',
    schema: FarmerFarmSchema,
    getKey: (item) => item.id,
    initialData: farmerUsers.flatMap(buildFarms),
  })
)

export function ensureFarmerStoreSettings(farmer: User) {
  const existing = farmerStoreSettingsCollection.get(farmer.id)
  if (existing) return existing
  const settings = buildStoreSettings(farmer)
  farmerStoreSettingsCollection.insert(settings)
  return settings
}

export function ensureFarmerFarms(farmer: User) {
  const existing = Array.from(farmerFarmsCollection.values()).filter(
    (farm) => farm.farmerId === farmer.id
  )
  if (existing.length > 0) return existing
  const farms = buildFarms(farmer)
  for (const farm of farms) farmerFarmsCollection.insert(farm)
  return farms
}
