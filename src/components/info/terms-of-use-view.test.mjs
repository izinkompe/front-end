import { expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { resolveInfoCenterTab } from './info-center-data.ts'
import { InfoCenterView } from './info-center-view.tsx'
import { TermsOfUseView } from './terms-of-use-view.tsx'

test('resolves Pusat Informasi tab query parameters including aliases', () => {
  expect(resolveInfoCenterTab(undefined)).toBe('bantuan')
  expect(resolveInfoCenterTab('bantuan')).toBe('bantuan')
  expect(resolveInfoCenterTab('syarat')).toBe('syarat')
  expect(resolveInfoCenterTab('syarat-dan-ketentuan')).toBe('syarat')
  expect(resolveInfoCenterTab('privasi')).toBe('kebijakan-privasi')
  expect(resolveInfoCenterTab('kebijakan-privasi')).toBe('kebijakan-privasi')
  expect(resolveInfoCenterTab('aksesibilitas')).toBe('aksesibilitas')
  expect(resolveInfoCenterTab('kontak')).toBe('kontak')
  expect(resolveInfoCenterTab('hubungi-kami')).toBe('kontak')
  expect(resolveInfoCenterTab(['kebijakan-privasi'])).toBe('kebijakan-privasi')
})

test('renders PanganTani terms of use hero, URL tab links, and main heading', () => {
  const html = renderToStaticMarkup(createElement(TermsOfUseView))

  expect(html).toContain('Pusat Informasi')
  expect(html).toContain('Syarat, Ketentuan, dan Pemberitahuan PanganTani')
  expect(html).toContain('Berlaku sejak: 26 November 2026')
  expect(html).toContain('Ketentuan Penggunaan')
  expect(html).toContain('href="/pusat-informasi?tab=bantuan"')
  expect(html).toContain('href="/pusat-informasi?tab=syarat"')
  expect(html).toContain('href="/pusat-informasi?tab=kebijakan-privasi"')
  expect(html).toContain('href="/pusat-informasi?tab=aksesibilitas"')
  expect(html).toContain('href="/pusat-informasi?tab=kontak"')
})

test('renders table of contents anchors and responsive transaction rules table', () => {
  const html = renderToStaticMarkup(createElement(TermsOfUseView))

  expect(html).toContain('href="#penggunaan-layanan"')
  expect(html).toContain('href="#reservasi-dan-pembayaran"')
  expect(html).toContain('href="#transaksi-petani"')
  expect(html).toContain('href="#hukum-yang-berlaku"')
  expect(html).toContain('<table')
  expect(html).toContain('<caption')
  expect(html).toContain('scope="col"')
  expect(html).toContain('scope="row"')
})

test('renders unified InfoCenterView for bantuan, kebijakan-privasi, and kontak tabs', () => {
  const helpHtml = renderToStaticMarkup(createElement(InfoCenterView, { activeTab: 'bantuan' }))
  const privacyHtml = renderToStaticMarkup(
    createElement(InfoCenterView, { activeTab: 'kebijakan-privasi' })
  )
  const contactHtml = renderToStaticMarkup(createElement(InfoCenterView, { activeTab: 'kontak' }))

  expect(helpHtml).toContain('Pusat Bantuan PanganTani')
  expect(helpHtml).toContain('Pesan hasil panen')
  expect(privacyHtml).toContain('Kebijakan Privasi PanganTani')
  expect(privacyHtml).toContain('Data akun dan pesanan')
  expect(contactHtml).toContain('Hubungi PanganTani')
  expect(contactHtml).toContain('bantuan@pangantani.id')
  expect(contactHtml).toContain('mitra@pangantani.id')
})
