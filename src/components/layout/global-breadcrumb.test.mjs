import { expect, test } from 'bun:test'
import { generateBreadcrumbsFromPath } from './global-breadcrumb.tsx'

test('generates correct breadcrumbs for root homepage', () => {
  const crumbs = generateBreadcrumbsFromPath('/')
  expect(crumbs.length).toBe(1)
  expect(crumbs[0].label).toBe('Beranda')
})

test('generates correct breadcrumbs for public pasar page', () => {
  const crumbs = generateBreadcrumbsFromPath('/pasar')
  expect(crumbs.length).toBe(2)
  expect(crumbs[0].label).toBe('Beranda')
  expect(crumbs[0].href).toBe('/')
  expect(crumbs[1].label).toBe('Pasar Pangan')
  expect(crumbs[1].href).toBeUndefined()
})

test('generates correct breadcrumbs for farmer dashboard root', () => {
  const crumbs = generateBreadcrumbsFromPath('/dashboard')
  expect(crumbs.length).toBe(2)
  expect(crumbs[0].label).toBe('Dashboard')
  expect(crumbs[0].href).toBe('/dashboard')
  expect(crumbs[1].label).toBe('Ringkasan Tani')
})

test('generates correct breadcrumbs for farmer nested route', () => {
  const crumbs = generateBreadcrumbsFromPath('/dashboard/komoditas/tambah')
  expect(crumbs.length).toBe(3)
  expect(crumbs[0].label).toBe('Dashboard')
  expect(crumbs[1].label).toBe('Komoditas & Panen')
  expect(crumbs[1].href).toBe('/dashboard/komoditas')
  expect(crumbs[2].label).toBe('Tambah Panen')
  expect(crumbs[2].href).toBeUndefined()
})

test('generates correct breadcrumbs for admin dashboard root', () => {
  const crumbs = generateBreadcrumbsFromPath('/dashboard/admin')
  expect(crumbs.length).toBe(3)
  expect(crumbs[0].label).toBe('Dashboard')
  expect(crumbs[1].label).toBe('Admin')
  expect(crumbs[2].label).toBe('Ringkasan Operasional')
})

test('generates correct breadcrumbs for admin payment verification route', () => {
  const crumbs = generateBreadcrumbsFromPath('/dashboard/admin/verifikasi-pembayaran')
  expect(crumbs.length).toBe(3)
  expect(crumbs[0].label).toBe('Dashboard')
  expect(crumbs[1].label).toBe('Admin')
  expect(crumbs[2].label).toBe('Verifikasi Pembayaran')
})
