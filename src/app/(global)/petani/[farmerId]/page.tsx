import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FarmerStoreSkeleton } from '@/components/farmer-store/farmer-store-skeleton'
import { FarmerStoreView } from '@/components/farmer-store/farmer-store-view'
import { JsonLd } from '@/components/seo/json-ld'
import { getAllPublicFarmerIds, getPublicFarmerStoreById } from '@/lib/api/db/farmer-routes'
import { FarmerIdSchema } from '@/lib/data/farmer-store-helpers'
import {
  buildBreadcrumbJsonLd,
  buildFarmerBusinessJsonLd,
  buildNoIndexMetadata,
  buildPublicMetadata,
} from '@/lib/seo'

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
    return buildNoIndexMetadata({
      title: 'Profil Petani Tidak Ditemukan',
      description: 'Profil kebun petani yang Anda cari tidak ditemukan di PanganTani.',
    })
  }

  const store = getPublicFarmerStoreById(parsed.data)
  if (!store) {
    return buildNoIndexMetadata({
      title: 'Profil Kebun Petani',
      description:
        'Daftar penawaran panen surplus dan ulasan pembeli untuk petani mitra PanganTani.',
    })
  }

  return buildPublicMetadata({
    title: store.farmName,
    description: `${store.farmName} di ${store.areaName}. Jelajahi penawaran hasil panen surplus dan ulasan pembeli.`,
    path: `/petani/${store.id}`,
    image: store.avatarUrl ?? undefined,
    imageAlt: `Kebun ${store.farmName}`,
    keywords: [store.farmName, store.areaName, 'petani mitra PanganTani'],
  })
}

async function FarmerStoreContent({ params }: FarmerStorePageProps) {
  const { farmerId } = await params
  const parsed = FarmerIdSchema.safeParse(farmerId)
  if (!parsed.success) {
    notFound()
  }

  const store = getPublicFarmerStoreById(parsed.data)

  return (
    <>
      {store ? (
        <>
          <JsonLd data={buildFarmerBusinessJsonLd(store)} />
          <JsonLd
            data={buildBreadcrumbJsonLd([
              { name: 'Beranda', path: '/' },
              { name: 'Pasar Panen', path: '/pasar' },
              { name: store.farmName, path: `/petani/${store.id}` },
            ])}
          />
        </>
      ) : null}
      <FarmerStoreView farmerId={parsed.data} />
    </>
  )
}

export default function FarmerStorePage({ params }: FarmerStorePageProps) {
  return (
    <Suspense fallback={<FarmerStoreSkeleton />}>
      <FarmerStoreContent params={params} />
    </Suspense>
  )
}
