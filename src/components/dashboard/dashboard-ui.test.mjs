import { describe, expect, test } from 'bun:test'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DASHBOARD_DIR = join(import.meta.dir)

function readDashboardFile(filename) {
  return readFileSync(join(DASHBOARD_DIR, filename), 'utf8')
}

describe('dashboard typography, responsive layout, and unslop-ui', () => {
  test('dashboard components do not regress to sub-14px text-xs', () => {
    const files = readdirSync(DASHBOARD_DIR).filter((file) => file.endsWith('.tsx'))

    for (const file of files) {
      const content = readDashboardFile(file)
      expect(content).not.toMatch(/\btext-xs\b/)
    }
  })

  test('dashboard shell, header, sidebar, and banner enforce touch targets and wrapping', () => {
    const header = readDashboardFile('dashboard-header.tsx')
    const sidebar = readDashboardFile('dashboard-sidebar.tsx')
    const shell = readDashboardFile('dashboard-shell.tsx')
    const banner = readDashboardFile('relaxed-auth-banner.tsx')

    expect(header).toContain('min-h-16')
    expect(header).toContain('BreadcrumbTrail')
    expect(header).toContain('touch-target')
    expect(header).toContain('max-w-[calc(100vw-2rem)]')
    expect(header).toContain('text-meta')
    expect(header).toContain('icon-sm')

    expect(sidebar).toContain('icon-sm')
    expect(sidebar).toContain('text-meta')

    expect(shell).toContain("SidebarInset className='min-w-0'")
    expect(banner).toContain('text-meta')
    expect(banner).toContain('flex-wrap')
  })

  test('overview and statistics cards use type-kpi, text-meta, and remove decorative module chrome', () => {
    const adminOverview = readDashboardFile('admin-overview.tsx')
    const farmerOverview = readDashboardFile('farmer-overview.tsx')
    const adminStatistik = readDashboardFile('admin-statistik-view.tsx')

    expect(adminOverview).toContain('type-kpi')
    expect(adminOverview).toContain('text-meta')
    expect(adminOverview).not.toContain('CardDescription>{item.description}')
    expect(adminOverview).not.toContain('Terverifikasi di platform PanganTani')

    expect(farmerOverview).toContain('type-kpi')
    expect(farmerOverview).toContain('text-meta')
    expect(farmerOverview).not.toContain('CardDescription>{item.description}')
    expect(farmerOverview).not.toContain('Siap dipesan pembeli')

    expect(adminStatistik).toContain('type-kpi')
    expect(adminStatistik).toContain('text-meta')
  })

  test('farmer and admin management views enforce mobile wrapping, responsive grids, and clean copy', () => {
    const farms = readDashboardFile('farmer-farms-view.tsx')
    const offers = readDashboardFile('farmer-offers-view.tsx')
    const orders = readDashboardFile('farmer-orders-view.tsx')
    const store = readDashboardFile('farmer-store-view.tsx')
    const moderasi = readDashboardFile('admin-moderasi-view.tsx')
    const pengguna = readDashboardFile('admin-pengguna-view.tsx')
    const verifikasi = readDashboardFile('admin-verifikasi-view.tsx')

    expect(farms).toContain('icon-sm')
    expect(farms).toContain('max-h-[90dvh] overflow-y-auto')
    expect(farms).not.toContain('DialogDescription')

    expect(offers).toContain('flex-wrap')
    expect(orders).toContain('text-meta')
    expect(orders).toContain('grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4')
    expect(store).toContain('w-full sm:w-auto')

    expect(moderasi).toContain('flex-wrap')
    expect(moderasi).toContain('grid-cols-1 gap-3 text-sm sm:grid-cols-3')
    expect(moderasi).toContain('Lihat di Pasar Panen')
    expect(moderasi).not.toContain('Lihat publik')

    expect(pengguna).toContain('flex-wrap')
    expect(pengguna).toContain('text-meta')
    expect(pengguna).not.toContain('RBAC')

    expect(verifikasi).toContain('flex-wrap')
    expect(verifikasi).toContain('grid-cols-1 gap-3 text-sm sm:grid-cols-2')
  })
})
