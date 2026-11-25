import { describe, expect, test } from 'bun:test'
import { buildBuyerSearchHref, formatPickupDateIso } from './hero-search-params'

const lembangLocation = {
  provinceId: 'jawa-barat',
  regionId: 'bandung-barat',
  label: 'Bandung Barat (Lembang)',
}

const allWestJavaLocation = {
  provinceId: 'jawa-barat',
  regionId: null,
  label: 'Semua Jawa Barat',
}

describe('formatPickupDateIso', () => {
  test('formats local date as YYYY-MM-DD with zero padding', () => {
    expect(formatPickupDateIso(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(formatPickupDateIso(new Date(2026, 10, 26))).toBe('2026-11-26')
  })
})

describe('buildBuyerSearchHref', () => {
  test('builds catalog mode URL with category and pickup date', () => {
    const href = buildBuyerSearchHref({
      mode: 'katalog',
      query: '  Tomat Ceri  ',
      category: 'sayuran',
      radiusKm: '10',
      minStockKg: '25',
      deadlineWindow: '3h',
      pickupDate: '2026-11-26',
      location: lembangLocation,
    })

    expect(href).toBe(
      '/pasar?q=Tomat+Ceri&category=sayuran&pickup=2026-11-26&province=jawa-barat&region=bandung-barat&view=list'
    )
  })

  test('builds map radius mode URL with radius and minStock', () => {
    const href = buildBuyerSearchHref({
      mode: 'peta',
      query: '   ',
      category: 'buah',
      radiusKm: '25',
      minStockKg: '50',
      deadlineWindow: '6h',
      pickupDate: '2026-11-26',
      location: allWestJavaLocation,
    })

    expect(href).toBe('/pasar?radius=25&minStock=50&province=jawa-barat&view=map')
  })

  test('builds expiring soon mode URL with deadline window and pickup date', () => {
    const href = buildBuyerSearchHref({
      mode: 'segera-ditutup',
      query: 'Mangga',
      category: 'buah',
      radiusKm: '5',
      minStockKg: '10',
      deadlineWindow: '3h',
      pickupDate: '2026-11-27',
      location: lembangLocation,
    })

    expect(href).toBe(
      '/pasar?q=Mangga&deadline=3h&pickup=2026-11-27&province=jawa-barat&region=bandung-barat&sort=expiring'
    )
  })

  test('falls back safely to /pasar on invalid pickupDate format', () => {
    const href = buildBuyerSearchHref({
      mode: 'katalog',
      query: 'Cabai',
      category: 'semua',
      radiusKm: '10',
      minStockKg: 'semua',
      deadlineWindow: 'semua',
      pickupDate: '26-11-2026',
      location: lembangLocation,
    })

    expect(href).toBe('/pasar')
  })

  test('falls back safely to /pasar on invalid location input', () => {
    const href = buildBuyerSearchHref({
      mode: 'katalog',
      query: 'Cabai',
      category: 'semua',
      radiusKm: '10',
      minStockKg: 'semua',
      deadlineWindow: 'semua',
      pickupDate: null,
      location: {
        provinceId: '',
        regionId: null,
        label: '',
      },
    })

    expect(href).toBe('/pasar')
  })
})
