import type { Metadata } from 'next'
import { FavoritesView } from '@/components/favorites/favorites-view'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Favorit',
  description: 'Daftar penawaran panen surplus dan petani favorit yang Anda simpan di PanganTani.',
})

export default function FavoritesPage() {
  return <FavoritesView />
}
