import { expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table.tsx'

test('renders keyboard-focusable region, container query wrapper, and default scope="col"', () => {
  const html = renderToStaticMarkup(
    createElement(
      Table,
      null,
      createElement(TableCaption, null, 'Daftar komoditas'),
      createElement(
        TableHeader,
        null,
        createElement(
          TableRow,
          null,
          createElement(TableHead, null, 'Komoditas'),
          createElement(TableHead, null, 'Harga')
        )
      ),
      createElement(
        TableBody,
        null,
        createElement(
          TableRow,
          null,
          createElement(TableHead, { scope: 'row' }, 'Beras'),
          createElement(TableCell, null, 'Rp15.000')
        )
      )
    )
  )

  expect(html).toContain('role="region"')
  expect(html).toContain('tabindex="0"')
  expect(html).toContain('aria-label="Tabel data"')
  expect(html).toContain('data-responsive="scroll"')
  expect(html).toContain('@container/table')
  expect(html).toContain('scope="col"')
  expect(html).toContain('scope="row"')
  expect(html).toContain('border-separate')
})

test('supports stacked responsive layout, sticky headers, density, and cell data-label', () => {
  const html = renderToStaticMarkup(
    createElement(
      Table,
      {
        responsiveLayout: 'stack',
        stickyHeader: true,
        stickyRowHeader: true,
        density: 'compact',
        'aria-labelledby': 'table-heading',
      },
      createElement(
        TableBody,
        null,
        createElement(
          TableRow,
          null,
          createElement(TableCell, { label: 'Status', nowrap: true }, 'Aktif')
        )
      ),
      createElement(
        TableFooter,
        null,
        createElement(TableRow, null, createElement(TableCell, null, 'Total'))
      )
    )
  )

  expect(html).toContain('data-responsive="stack"')
  expect(html).toContain('data-sticky-header="true"')
  expect(html).toContain('data-sticky-row-header="true"')
  expect(html).toContain('data-density="compact"')
  expect(html).toContain('aria-labelledby="table-heading"')
  expect(html).not.toContain('aria-label="Tabel data"')
  expect(html).toContain('data-label="Status"')
  expect(html).toContain('whitespace-nowrap')
  expect(html).toContain('max-h-[min(32rem,75dvh)]')
})
