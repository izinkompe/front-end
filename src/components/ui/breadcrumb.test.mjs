import { expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { BreadcrumbTrail } from './breadcrumb.tsx'

test('BreadcrumbTrail renders inline items when count is 2 or fewer', () => {
  const html = renderToStaticMarkup(
    createElement(BreadcrumbTrail, {
      items: [{ label: 'Beranda', href: '/' }, { label: 'Pasar' }],
    })
  )

  expect(html).toContain('Beranda')
  expect(html).toContain('Pasar')
  expect(html).toContain('aria-current="page"')
  expect(html).not.toContain('Halaman lainnya')
})

test('BreadcrumbTrail collapses middle items into dropdown trigger when count exceeds 2', () => {
  const html = renderToStaticMarkup(
    createElement(BreadcrumbTrail, {
      items: [
        { label: 'Beranda', href: '/' },
        { label: 'Pasar', href: '/pasar' },
        { label: 'Sayuran', href: '/pasar/sayuran' },
        { label: 'Tomat Merah' },
      ],
    })
  )

  expect(html).toContain('Beranda')
  expect(html).toContain('Tomat Merah')
  expect(html).toContain('Halaman lainnya')
  expect(html).toContain('Pilih dari 2 halaman induk')
  expect(html).not.toContain('>Sayuran<')
})
