import { expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createDefaultCatalogState } from '@/lib/data/catalog-params'
import { CatalogToolbar } from './catalog-toolbar.tsx'

test('CatalogToolbar renders unified quick filter dropdown, horizontal scroll strip, and active filter count', () => {
  const html = renderToStaticMarkup(
    createElement(CatalogToolbar, {
      state: createDefaultCatalogState(),
      activeFilterCount: 2,
      onOpenFilterSheet: () => {},
      onStateChange: () => {},
    })
  )

  expect(html).toContain('Semua filter')
  expect(html).toContain('Filter cepat')
  expect(html).toContain('Baris penuh')
  expect(html).toContain('scroll-strip')
  expect(html).toContain('>2<')
})

test('CatalogToolbar shows active condition label when single condition is selected', () => {
  const state = createDefaultCatalogState('sayuran')
  state.conditions = ['ripe_urgent']

  const html = renderToStaticMarkup(
    createElement(CatalogToolbar, {
      state,
      fixedCategory: 'sayuran',
      activeFilterCount: 1,
      onOpenFilterSheet: () => {},
      onStateChange: () => {},
    })
  )

  expect(html).toContain('Segera olah')
  expect(html).not.toContain('Padi &amp; Biji')
})
