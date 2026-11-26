import { expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createDefaultCatalogState } from '@/lib/data/catalog-params'
import { CatalogToolbar } from './catalog-toolbar.tsx'

test('CatalogToolbar renders category chips, quick filters, and active filter count', () => {
  const html = renderToStaticMarkup(
    createElement(CatalogToolbar, {
      state: createDefaultCatalogState(),
      activeFilterCount: 2,
      onOpenFilterSheet: () => {},
      onStateChange: () => {},
    })
  )

  expect(html).toContain('Sayuran')
  expect(html).toContain('Buah')
  expect(html).toContain('Segera ditutup')
  expect(html).toContain('Harga turun')
  expect(html).toContain('Semua filter')
  expect(html).toContain('>2<')
  expect(html).toContain('hidden sm:inline-flex')
})

test('CatalogToolbar renders condition chips when fixedCategory is set', () => {
  const html = renderToStaticMarkup(
    createElement(CatalogToolbar, {
      state: createDefaultCatalogState('sayuran'),
      fixedCategory: 'sayuran',
      activeFilterCount: 0,
      onOpenFilterSheet: () => {},
      onStateChange: () => {},
    })
  )

  expect(html).toContain('Segera olah')
  expect(html).toContain('Grade B')
  expect(html).not.toContain('Padi &amp; Biji')
})
