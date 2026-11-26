import type { MetadataRoute } from 'next'
import { getAllPublicFarmerIds } from '@/lib/api/db/farmer-routes'
import { mockOffersData } from '@/lib/api/db/fixtures/offers.fixture'
import { mainCategories } from '@/lib/data/categories'
import { buildAbsoluteUrl } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: Array<{
    path: string
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
    priority: number
  }> = [
    { path: '/', changeFrequency: 'hourly', priority: 1 },
    { path: '/pasar', changeFrequency: 'hourly', priority: 0.9 },
    { path: '/papan-kebutuhan', changeFrequency: 'daily', priority: 0.8 },
    { path: '/bantuan', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/kontak', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/pusat-informasi', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/syarat', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/privasi', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/aksesibilitas', changeFrequency: 'yearly', priority: 0.3 },
  ]

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: buildAbsoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const categoryEntries: MetadataRoute.Sitemap = mainCategories.map((category) => ({
    url: buildAbsoluteUrl(category.href),
    lastModified: now,
    changeFrequency: 'hourly',
    priority: 0.85,
  }))

  const offerEntries: MetadataRoute.Sitemap = mockOffersData
    .filter((offer) => offer.status === 'active')
    .map((offer) => ({
      url: buildAbsoluteUrl(`/pasar/penawaran/${offer.id}`),
      lastModified: new Date(offer.updatedAt),
      changeFrequency: 'hourly',
      priority: 0.8,
    }))

  const farmerEntries: MetadataRoute.Sitemap = getAllPublicFarmerIds().map((farmerId) => ({
    url: buildAbsoluteUrl(`/petani/${farmerId}`),
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.75,
  }))

  return [...staticEntries, ...categoryEntries, ...offerEntries, ...farmerEntries]
}
