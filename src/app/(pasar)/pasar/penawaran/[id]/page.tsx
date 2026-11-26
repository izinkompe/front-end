import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { OfferDetailSkeleton } from '@/components/offer-detail/offer-detail-skeleton'
import { OfferDetailView } from '@/components/offer-detail/offer-detail-view'
import { mockOffersData } from '@/lib/api/db/fixtures/offers.fixture'

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
    return {
      title: 'Penawaran Tidak Ditemukan | PanganTani',
    }
  }

  const offer = mockOffersData.find((item) => item.id === parsed.data)
  if (!offer) {
    return {
      title: 'Detail Penawaran | PanganTani',
      description: 'Informasi harga per kilogram, stok panen surplus, dan jadwal ambil mandiri.',
    }
  }

  return {
    title: `${offer.commodityName} | PanganTani`,
    description: `${offer.commodityName} di ${offer.pickupAddressArea} dengan sistem ambil mandiri.`,
  }
}

export default async function OfferDetailPage({ params }: OfferDetailPageProps) {
  const { id } = await params
  const parsed = OfferIdParamSchema.safeParse(id)
  if (!parsed.success) {
    notFound()
  }

  return (
    <Suspense fallback={<OfferDetailSkeleton />}>
      <OfferDetailView offerId={parsed.data} />
    </Suspense>
  )
}
