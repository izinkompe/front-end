import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FarmerStoreSkeleton } from '@/components/farmer-store/farmer-store-skeleton'
import { FarmerStoreView } from '@/components/farmer-store/farmer-store-view'
import { getAllPublicFarmerIds, getPublicFarmerStoreById } from '@/lib/api/db/farmer-routes'
import { FarmerIdSchema } from '@/lib/data/farmer-store-helpers'

export function generateStaticParams() {
  return getAllPublicFarmerIds().map((farmerId) => ({
    farmerId,
  }))
}

interface FarmerStorePageProps {
  params: Promise<{ farmerId: string }>
}

export async function generateMetadata({ params }: FarmerStorePageProps): Promise<Metadata> {
  const { farmerId } = await params
  const parsed = FarmerIdSchema.safeParse(farmerId)
  if (!parsed.success) {
    return {
      title: 'Profil Petani Tidak Ditemukan | PanganTani',
    }
  }

  const store = getPublicFarmerStoreById(parsed.data)
  if (!store) {
    return {
      title: 'Profil Kebun Petani | PanganTani',
      description:
        'Daftar penawaran panen surplus dan ulasan pembeli untuk petani mitra PanganTani.',
    }
  }

  return {
    title: `${store.farmName} | PanganTani`,
    description: `${store.farmName} di ${store.areaName}. Jelajahi penawaran hasil panen surplus dan ulasan pembeli.`,
  }
}

export default async function FarmerStorePage({ params }: FarmerStorePageProps) {
  const { farmerId } = await params
  const parsed = FarmerIdSchema.safeParse(farmerId)
  if (!parsed.success) {
    notFound()
  }

  return (
    <Suspense fallback={<FarmerStoreSkeleton />}>
      <FarmerStoreView farmerId={parsed.data} />
    </Suspense>
  )
}
