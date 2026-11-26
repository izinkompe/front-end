import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { OfferDetailSkeleton } from '@/components/offer-detail/offer-detail-skeleton'
import { OfferDetailView } from '@/components/offer-detail/offer-detail-view'
import { JsonLd } from '@/components/seo/json-ld'
import { mockOffersData } from '@/lib/api/db/fixtures/offers.fixture'
import {
  buildBreadcrumbJsonLd,
  buildNoIndexMetadata,
  buildOfferProductJsonLd,
  buildPublicMetadata,
} from '@/lib/seo'

const OfferIdParamSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/)

export function generateStaticParams() {
  return mockOffersData.map((offer) => ({
    id: offer.id,
  }))
}

interface OfferDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: OfferDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const parsed = OfferIdParamSchema.safeParse(id)
  if (!parsed.success) {
    return buildNoIndexMetadata({
      title: 'Penawaran Tidak Ditemukan',
      description: 'Penawaran panen yang Anda cari tidak valid atau sudah tidak tersedia.',
    })
  }

  const offer = mockOffersData.find((item) => item.id === parsed.data)
  if (!offer) {
    return buildNoIndexMetadata({
      title: 'Detail Penawaran',
      description: 'Informasi harga per kilogram, stok panen surplus, dan jadwal ambil mandiri.',
    })
  }

  return buildPublicMetadata({
    title: offer.commodityName,
    description: `${offer.commodityName} di ${offer.pickupAddressArea} harga Rp${offer.pricePerKg.toLocaleString('id-ID')}/kg dengan sistem ambil mandiri.`,
    path: `/pasar/penawaran/${offer.id}`,
    image: offer.photos[0],
    imageAlt: `${offer.commodityName} dari ${offer.farmerName}`,
    keywords: [offer.commodityName, offer.category, offer.pickupAddressArea],
  })
}

async function OfferDetailContent({ params }: OfferDetailPageProps) {
  const { id } = await params
  const parsed = OfferIdParamSchema.safeParse(id)
  if (!parsed.success) {
    notFound()
  }

  const offer = mockOffersData.find((item) => item.id === parsed.data)

  return (
    <>
      {offer ? (
        <>
          <JsonLd data={buildOfferProductJsonLd(offer)} />
          <JsonLd
            data={buildBreadcrumbJsonLd([
              { name: 'Beranda', path: '/' },
              { name: 'Pasar Panen', path: '/pasar' },
              { name: offer.commodityName, path: `/pasar/penawaran/${offer.id}` },
            ])}
          />
        </>
      ) : null}
      <OfferDetailView offerId={parsed.data} />
    </>
  )
}

export default function OfferDetailPage({ params }: OfferDetailPageProps) {
  return (
    <Suspense fallback={<OfferDetailSkeleton />}>
      <OfferDetailContent params={params} />
    </Suspense>
  )
}
