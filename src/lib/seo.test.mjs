import { describe, expect, it } from 'bun:test'
import { buyerFaqItems } from './data/faq'
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  buildAbsoluteUrl,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildNoIndexMetadata,
  buildOfferProductJsonLd,
  buildPublicMetadata,
} from './seo'

describe('SEO helpers', () => {
  it('builds canonical and OpenGraph metadata for public pages', () => {
    const meta = buildPublicMetadata({
      title: 'Pasar Panen',
      description: 'Jelajahi panen surplus langsung dari petani.',
      path: '/pasar',
    })

    expect(meta.title).toBe('Pasar Panen')
    expect(meta.alternates?.canonical).toBe(buildAbsoluteUrl('/pasar'))
    expect(meta.robots).toEqual({ index: true, follow: true })
    expect(meta.openGraph?.title).toBe(`Pasar Panen | ${SITE_NAME}`)
    expect(meta.openGraph?.url).toBe(buildAbsoluteUrl('/pasar'))
    expect(meta.twitter?.card).toBe('summary_large_image')
  })

  it('supports absolute title without template suffix on homepage', () => {
    const meta = buildPublicMetadata({
      title: 'PanganTani — Beranda',
      description: 'Deskripsi beranda.',
      path: '/',
      absoluteTitle: true,
    })

    expect(meta.title).toEqual({ absolute: 'PanganTani — Beranda' })
    expect(meta.alternates?.canonical).toBe(buildAbsoluteUrl('/'))
    expect(meta.openGraph?.images).toEqual([
      {
        url: buildAbsoluteUrl(DEFAULT_OG_IMAGE),
        alt: 'PanganTani — Panen Surplus Langsung dari Petani Sekitar',
      },
    ])
  })

  it('builds noindex metadata for private and transactional routes', () => {
    const meta = buildNoIndexMetadata({
      title: 'Pesanan Saya',
      description: 'Pantau pesanan Anda.',
    })

    expect(meta.title).toBe('Pesanan Saya')
    expect(meta.robots).toEqual({
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    })
  })

  it('builds valid BreadcrumbList and FAQPage JSON-LD', () => {
    const breadcrumbs = buildBreadcrumbJsonLd([
      { name: 'Beranda', path: '/' },
      { name: 'Pasar', path: '/pasar' },
    ])
    expect(breadcrumbs['@type']).toBe('BreadcrumbList')
    expect(breadcrumbs.itemListElement).toHaveLength(2)
    expect(breadcrumbs.itemListElement[1]?.position).toBe(2)

    const faq = buildFaqJsonLd(buyerFaqItems)
    expect(faq['@type']).toBe('FAQPage')
    expect(faq.mainEntity).toHaveLength(buyerFaqItems.length)
  })

  it('builds Product and Offer JSON-LD for active offers', () => {
    const product = buildOfferProductJsonLd({
      id: 'off-test',
      farmerId: 'usr-pt-01',
      farmerName: 'Pak Joko',
      commodityName: 'Mangga Harum Manis',
      category: 'Buah',
      condition: 'ripe_urgent',
      surplusReason: 'Panen melimpah',
      harvestDate: '2026-11-26T00:00:00.000Z',
      availableStockKg: 25,
      reservedStockKg: 0,
      soldStockKg: 10,
      pricePerKg: 12500,
      orderDeadline: '2026-11-27T00:00:00.000Z',
      pickupAddressArea: 'Lembang, Bandung Barat',
      pickupAddressFull: 'Jl. Maribaya No. 1',
      latitude: -6.8,
      longitude: 107.6,
      pickupScheduleSlots: [],
      photos: ['https://images.unsplash.com/photo-1553279768-865429fa0078'],
      status: 'active',
      createdAt: '2026-11-26T00:00:00.000Z',
      updatedAt: '2026-11-26T00:00:00.000Z',
    })

    expect(product['@type']).toBe('Product')
    expect(product.offers['@type']).toBe('Offer')
    expect(product.offers.priceCurrency).toBe('IDR')
    expect(product.offers.availability).toBe('https://schema.org/InStock')
  })
})
