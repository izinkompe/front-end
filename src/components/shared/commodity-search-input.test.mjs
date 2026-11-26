import { expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CommoditySearchInput } from './commodity-search-input.tsx'

test('CommoditySearchInput hides clear button when query is empty', () => {
  const html = renderToStaticMarkup(
    createElement(CommoditySearchInput, {
      value: '',
      onChange: () => {},
    })
  )

  expect(html).toContain('type="search"')
  expect(html).toContain('icon-md')
  expect(html).not.toContain('Hapus kata kunci pencarian')
})

test('CommoditySearchInput renders accessible clear button when query is present', () => {
  const html = renderToStaticMarkup(
    createElement(CommoditySearchInput, {
      value: 'tomat',
      onChange: () => {},
    })
  )

  expect(html).toContain('Hapus kata kunci pencarian')
  expect(html).toContain('touch-target')
})
