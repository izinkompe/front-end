import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CatalogLoadingSkeleton } from '@/components/catalog/catalog-loading-skeleton'
import { CatalogView } from '@/components/catalog/catalog-view'
import { BuyerCategorySlugSchema, getCategoryMeta, mainCategories } from '@/lib/data/categories'

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
    return {
      title: 'Kategori Tidak Ditemukan | PanganTani',
    }
  }

  const meta = getCategoryMeta(parsed.data)
  return {
    title: `Panen ${meta.label} | PanganTani`,
    description: `Penawaran ${meta.label.toLowerCase()} surplus (${meta.examples}) dalam satuan kilogram dengan sistem ambil mandiri.`,
  }
}

async function PasarCategoryContent({ params }: PasarCategoryPageProps) {
  const { category } = await params
  const parsed = BuyerCategorySlugSchema.safeParse(category)
  if (!parsed.success) {
    notFound()
  }

  return <CatalogView fixedCategory={parsed.data} />
}

export default function PasarCategoryPage({ params }: PasarCategoryPageProps) {
  return (
    <Suspense fallback={<CatalogLoadingSkeleton />}>
      <PasarCategoryContent params={params} />
    </Suspense>
  )
}
