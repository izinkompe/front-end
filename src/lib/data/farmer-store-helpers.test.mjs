import { describe, expect, test } from 'bun:test'
import {
  buildFarmerShowcases,
  buildFarmerStoreHref,
  filterAndSortFarmerOffers,
  filterAndSortFarmerReviews,
  getFarmInitials,
} from './farmer-store-helpers'

const NOW_MS = Date.parse('2026-11-26T05:00:00Z')

const sampleOffers = [
  {
    id: 'off-a',
    farmerId: 'usr-pt-01',
    farmerName: 'Pak Joko',
    commodityName: 'Tomat Ceri',
    category: 'Sayuran',
    condition: 'grade_b',
    harvestDate: '2026-11-26T01:00:00Z',
    availableStockKg: 50,
    reservedStockKg: 0,
    soldStockKg: 20,
    pricePerKg: 14000,
    dynamicPriceRule: {
      startPrice: 16000,
      minPrice: 12000,
      dropIntervalHours: 4,
      dropAmount: 1000,
    },
    orderDeadline: '2026-11-26T08:00:00Z',
    pickupAddressArea: 'Lembang, Bandung Barat',
    latitude: -6.8167,
    longitude: 107.6167,
    pickupScheduleSlots: [],
    photos: [],
    status: 'active',
    createdAt: '2026-11-26T02:00:00Z',
    updatedAt: '2026-11-26T02:00:00Z',
  },
  {
    id: 'off-b',
    farmerId: 'usr-pt-01',
    farmerName: 'Pak Joko',
    commodityName: 'Mangga Harum Manis',
    category: 'Buah',
    condition: 'ripe_urgent',
    harvestDate: '2026-11-26T00:00:00Z',
    availableStockKg: 30,
    reservedStockKg: 0,
    soldStockKg: 40,
    pricePerKg: 11000,
    orderDeadline: '2026-11-27T08:00:00Z',
    pickupAddressArea: 'Lembang, Bandung Barat',
    latitude: -6.8167,
    longitude: 107.6167,
    pickupScheduleSlots: [],
    photos: [],
    status: 'active',
    createdAt: '2026-11-26T04:00:00Z',
    updatedAt: '2026-11-26T04:00:00Z',
  },
]

const sampleReviews = [
  {
    id: 'rev-1',
    farmerId: 'usr-pt-01',
    orderId: 'ord-1',
    offerId: 'off-a',
    commodityName: 'Tomat Ceri',
    quantityKg: 15,
    buyerDisplayName: 'Dapur Kasih',
    rating: 5,
    topics: ['freshness', 'weight_accuracy'],
    comment: 'Segar dan timbangan akurat',
    photos: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea'],
    helpfulCount: 12,
    createdAt: '2026-11-25T10:00:00Z',
  },
  {
    id: 'rev-2',
    farmerId: 'usr-pt-01',
    orderId: 'ord-2',
    offerId: 'off-b',
    commodityName: 'Mangga Harum Manis',
    quantityKg: 20,
    buyerDisplayName: 'Katering Mawar',
    rating: 4,
    topics: ['pickup_ease'],
    comment: 'Pengambilan mudah',
    photos: [],
    helpfulCount: 3,
    createdAt: '2026-11-26T01:00:00Z',
  },
]

describe('farmer-store-helpers', () => {
  test('buildFarmerStoreHref validates id and appends optional non-default tab', () => {
    expect(buildFarmerStoreHref('usr-pt-01')).toBe('/petani/usr-pt-01')
    expect(buildFarmerStoreHref('usr-pt-01', 'ulasan')).toBe('/petani/usr-pt-01?tab=ulasan')
    expect(buildFarmerStoreHref('../evil')).toBe('/pasar')
  })

  test('getFarmInitials produces clean two-letter fallback', () => {
    expect(getFarmInitials('Kelompok Tani Subur Makmur')).toBe('KT')
    expect(getFarmInitials('Subur')).toBe('SU')
  })

  test('buildFarmerShowcases and filterAndSortFarmerOffers filter dynamic, category, and sort', () => {
    const showcases = buildFarmerShowcases(sampleOffers, NOW_MS)
    expect(showcases.map((item) => item.id)).toEqual([
      'semua',
      'dinamis',
      'segera',
      'sayuran',
      'buah',
    ])

    const dynamicOnly = filterAndSortFarmerOffers(sampleOffers, {
      showcase: 'dinamis',
      searchQuery: '',
      sort: 'terbaru',
      referenceCoordinates: null,
      nowMs: NOW_MS,
    })
    expect(dynamicOnly.map((item) => item.offer.id)).toEqual(['off-a'])

    const cheapestFirst = filterAndSortFarmerOffers(sampleOffers, {
      showcase: 'semua',
      searchQuery: '',
      sort: 'termurah',
      referenceCoordinates: null,
      nowMs: NOW_MS,
    })
    expect(cheapestFirst.map((item) => item.offer.id)).toEqual(['off-b', 'off-a'])
  })

  test('filterAndSortFarmerReviews filters by photo, rating, topic, and sorts correctly', () => {
    const photoAndTopic = filterAndSortFarmerReviews(sampleReviews, {
      withPhotoOnly: true,
      ratings: [5],
      topics: ['weight_accuracy'],
      sort: 'terbaru',
    })
    expect(photoAndTopic.map((item) => item.id)).toEqual(['rev-1'])

    const byHelpful = filterAndSortFarmerReviews(sampleReviews, {
      withPhotoOnly: false,
      ratings: [],
      topics: [],
      sort: 'membantu',
    })
    expect(byHelpful.map((item) => item.id)).toEqual(['rev-1', 'rev-2'])
  })
})
