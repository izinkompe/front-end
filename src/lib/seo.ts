import type { Metadata } from 'next'
import type { FaqItem } from '@/lib/data/faq'
import { env } from '@/lib/env'
import type { FarmerStoreProfile } from '@/types/api/farmers'
import type { Offer } from '@/types/api/offers'

export const SITE_NAME = 'PanganTani'
export const DEFAULT_TITLE = 'PanganTani — Panen Surplus Langsung dari Petani Sekitar'
export const DEFAULT_DESCRIPTION =
  'Beli hasil panen surplus langsung dari petani sekitar Anda dengan harga per kilogram dan sistem ambil mandiri tanpa biaya kirim.'
export const DEFAULT_OG_IMAGE = '/images/hero.webp'

export const SITE_KEYWORDS = [
  'PanganTani',
  'panen surplus',
  'beli hasil panen langsung dari petani',
  'sayuran segar per kilogram',
  'buah surplus petani',
  'ambil mandiri hasil panen',
  'agrikultur berkelanjutan Indonesia',
]

export function getSiteUrl(): string {
  return env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '')
}

export function buildAbsoluteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getSiteUrl()}${normalizedPath === '/' ? '' : normalizedPath}`
}

export interface PublicMetadataOptions {
  title: string
  description: string
  path: string
  image?: string
  imageAlt?: string
  keywords?: string[]
  type?: 'website' | 'article'
  absoluteTitle?: boolean
}

export function buildPublicMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  imageAlt = DEFAULT_TITLE,
  keywords,
  type = 'website',
  absoluteTitle = false,
}: PublicMetadataOptions): Metadata {
  const canonicalUrl = buildAbsoluteUrl(path)
  const resolvedImage = image.startsWith('http') ? image : buildAbsoluteUrl(image)
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: keywords ? [...SITE_KEYWORDS, ...keywords] : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type,
      locale: 'id_ID',
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url: canonicalUrl,
      images: [
        {
          url: resolvedImage,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [resolvedImage],
    },
  }
}

export interface NoIndexMetadataOptions {
  title: string
  description: string
}

export function buildNoIndexMetadata({ title, description }: NoIndexMetadataOptions): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  }
}

export interface BreadcrumbItem {
  name: string
  path: string
}

export function buildOrganizationJsonLd() {
  const url = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url,
    logo: buildAbsoluteUrl('/images/hero.webp'),
    description: DEFAULT_DESCRIPTION,
  }
}

export function buildWebSiteJsonLd() {
  const url = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url,
    inLanguage: 'id-ID',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/pasar?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildWebPageJsonLd({
  name,
  description,
  path,
}: {
  name: string
  description: string
  path: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: buildAbsoluteUrl(path),
    inLanguage: 'id-ID',
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: getSiteUrl(),
    },
  }
}

export function buildCollectionPageJsonLd({
  name,
  description,
  path,
}: {
  name: string
  description: string
  path: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: buildAbsoluteUrl(path),
    inLanguage: 'id-ID',
  }
}

export function buildBreadcrumbJsonLd(items: ReadonlyArray<BreadcrumbItem>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: buildAbsoluteUrl(item.path),
    })),
  }
}

export function buildFaqJsonLd(items: ReadonlyArray<FaqItem>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function buildOfferProductJsonLd(offer: Offer) {
  const offerUrl = buildAbsoluteUrl(`/pasar/penawaran/${offer.id}`)
  const isAvailable = offer.status === 'active' && offer.availableStockKg > 0

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: offer.commodityName,
    category: offer.category,
    description: `${offer.commodityName} (${offer.surplusReason}) di ${offer.pickupAddressArea} dengan sistem ambil mandiri.`,
    image: offer.photos.length > 0 ? offer.photos : [buildAbsoluteUrl(DEFAULT_OG_IMAGE)],
    offers: {
      '@type': 'Offer',
      url: offerUrl,
      priceCurrency: 'IDR',
      price: offer.pricePerKg,
      priceValidUntil: offer.orderDeadline,
      availability: isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: offer.farmerName,
      },
    },
  }
}

export function buildFarmerBusinessJsonLd(store: FarmerStoreProfile) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: store.farmName,
    description: store.description,
    url: buildAbsoluteUrl(`/petani/${store.id}`),
    image: store.avatarUrl ?? buildAbsoluteUrl(DEFAULT_OG_IMAGE),
    address: {
      '@type': 'PostalAddress',
      addressLocality: store.areaName,
      addressCountry: 'ID',
    },
    ...(store.stats.totalRatings > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: store.stats.averageRating,
            reviewCount: store.stats.totalRatings,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  }
}
