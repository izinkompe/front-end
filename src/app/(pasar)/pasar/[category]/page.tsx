import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CatalogLoadingSkeleton } from '@/components/catalog/catalog-loading-skeleton'
import { CatalogView } from '@/components/catalog/catalog-view'
import { JsonLd } from '@/components/seo/json-ld'
import { BuyerCategorySlugSchema, getCategoryMeta, mainCategories } from '@/lib/data/categories'
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildNoIndexMetadata,
  buildPublicMetadata,
} from '@/lib/seo'

export function generateStaticParams() {
  return mainCategories.map((category) => ({
    category: category.slug,
  }))
}

interface PasarCategoryPageProps {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: PasarCategoryPageProps): Promise<Metadata> {
  const { category } = await params
  const parsed = BuyerCategorySlugSchema.safeParse(category)
  if (!parsed.success) {
    return buildNoIndexMetadata({
      title: 'Kategori Tidak Ditemukan',
      description: 'Kategori panen yang Anda cari tidak tersedia di PanganTani.',
    })
  }

  const meta = getCategoryMeta(parsed.data)
  return buildPublicMetadata({
    title: `Panen ${meta.label}`,
    description: `Penawaran ${meta.label.toLowerCase()} surplus (${meta.examples}) dalam satuan kilogram dengan sistem ambil mandiri.`,
    path: meta.href,
    keywords: [meta.label.toLowerCase(), meta.examples],
  })
}

async function PasarCategoryContent({ params }: PasarCategoryPageProps) {
  const { category } = await params
  const parsed = BuyerCategorySlugSchema.safeParse(category)
  if (!parsed.success) {
    notFound()
  }

  const meta = getCategoryMeta(parsed.data)

  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: `Panen ${meta.label}`,
          description: `Penawaran ${meta.label.toLowerCase()} surplus (${meta.examples}) dalam satuan kilogram dengan sistem ambil mandiri.`,
          path: meta.href,
        })}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Beranda', path: '/' },
          { name: 'Pasar Panen', path: '/pasar' },
          { name: meta.label, path: meta.href },
        ])}
      />
      <CatalogView fixedCategory={parsed.data} />
    </>
  )
}

export default function PasarCategoryPage({ params }: PasarCategoryPageProps) {
  return (
    <Suspense fallback={<CatalogLoadingSkeleton />}>
      <PasarCategoryContent params={params} />
    </Suspense>
  )
}
