import { describe, expect, test } from 'bun:test'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DASHBOARD_DIR = join(import.meta.dir)
const FARMER_SUBDIR = join(DASHBOARD_DIR, 'farmer')

function readDashboardFile(filename) {
  return readFileSync(join(DASHBOARD_DIR, filename), 'utf8')
}

function readFarmerSubFile(filename) {
  return readFileSync(join(FARMER_SUBDIR, filename), 'utf8')
}

describe('dashboard typography, responsive layout, and unslop-ui', () => {
  test('dashboard components do not regress to sub-14px text-xs', () => {
    const rootFiles = readdirSync(DASHBOARD_DIR).filter((file) => file.endsWith('.tsx'))
    const farmerFiles = readdirSync(FARMER_SUBDIR).filter((file) => file.endsWith('.tsx'))

    for (const file of rootFiles) {
      expect(readDashboardFile(file)).not.toMatch(/\btext-xs\b/)
    }
    for (const file of farmerFiles) {
      expect(readFarmerSubFile(file)).not.toMatch(/\btext-xs\b/)
    }
  })

  test('dashboard shell, header, sidebar, and banner enforce touch targets and wrapping', () => {
    const header = readDashboardFile('dashboard-header.tsx')
    const userMenu = readDashboardFile('dashboard-user-menu.tsx')
    const pageHeader = readDashboardFile('dashboard-page-header.tsx')
    const sidebar = readDashboardFile('dashboard-sidebar.tsx')
    const shell = readDashboardFile('dashboard-shell.tsx')
    const banner = readDashboardFile('relaxed-auth-banner.tsx')

    expect(header).toContain('min-h-16')
    expect(header).toContain('SidebarTrigger')
    expect(header).toContain('HeaderNotificationsPopover')
    expect(header).toContain('DashboardUserMenu')

    expect(userMenu).toContain('touch-target')
    expect(userMenu).toContain('max-w-[calc(100vw-1.5rem)]')
    expect(userMenu).toContain('text-meta')
    expect(userMenu).toContain('icon-sm')
    expect(userMenu).toContain('/dashboard/profil')

    expect(pageHeader).toContain('BreadcrumbTrail')

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
    expect(farmerOverview).toContain('/dashboard/papan-kebutuhan')
    expect(farmerOverview).not.toContain('CardDescription>{item.description}')
    expect(farmerOverview).not.toContain('Siap dipesan pembeli')

    expect(adminStatistik).toContain('type-kpi')
    expect(adminStatistik).toContain('text-meta')
  })

  test('all five farmer management pages use responsive Table wrapper, TanStack Form, and Sheets or dedicated pages', () => {
    const dataTable = readFarmerSubFile('farmer-data-table.tsx')
    const store = readDashboardFile('farmer-store-view.tsx')
    const storeShowcase = readFarmerSubFile('store-showcase-table.tsx')
    const storeReviews = readFarmerSubFile('store-reviews-table.tsx')
    const farms = readDashboardFile('farmer-farms-view.tsx')
    const farmForm = readFarmerSubFile('farmer-farm-form-content.tsx')
    const offers = readDashboardFile('farmer-offers-view.tsx')
    const offerForm = readFarmerSubFile('farmer-offer-form-body.tsx')
    const orders = readDashboardFile('farmer-orders-view.tsx')
    const needs = readDashboardFile('farmer-needs-board-view.tsx')
    const formModules = [
      'store-profile-tab.tsx',
      'bank-account-sheet.tsx',
      'review-reply-sheet.tsx',
      'farmer-farm-form-content.tsx',
      'farmer-offer-form-body.tsx',
      'offer-stock-sheet.tsx',
      'order-action-forms.tsx',
      'need-response-sheet.tsx',
    ]

    for (const file of formModules) {
      expect(readFarmerSubFile(file)).toContain("from '@tanstack/react-form'")
    }

    expect(dataTable).toContain("from '@/components/ui/table'")
    expect(dataTable).toContain("responsiveLayout='scroll'")
    expect(dataTable).toContain('aria-sort')

    expect(store).toContain('w-full sm:w-auto')
    expect(storeShowcase).toContain('FarmerDataTable')
    expect(storeReviews).toContain('FarmerDataTable')

    expect(farms).toContain('icon-sm')
    expect(farms).toContain('max-h-[90dvh] overflow-y-auto')
    expect(farms).toContain('FarmerDataTable')
    expect(farms).not.toMatch(/<DialogDescription/)
    expect(farmForm).toContain("from '@tanstack/react-form'")

    expect(offers).toContain('DashboardPageHeader')
    expect(offers).toContain('FarmerDataTable')
    expect(offerForm).toContain("from '@tanstack/react-form'")

    expect(orders).toContain('text-meta')
    expect(orders).toContain('FarmerDataTable')

    expect(needs).toContain('FarmerDataTable')
  })

  test('admin management views keep responsive grids and clean copy', () => {
    const moderasi = readDashboardFile('admin-moderasi-view.tsx')
    const pengguna = readDashboardFile('admin-pengguna-view.tsx')
    const verifikasi = readDashboardFile('admin-verifikasi-view.tsx')

    expect(moderasi).toContain('flex-wrap')
    expect(moderasi).toContain('grid-cols-1 gap-3 text-sm sm:grid-cols-3')
    expect(moderasi).toContain('Lihat di Pasar Panen')
    expect(moderasi).not.toContain('Lihat publik')

    expect(pengguna).toContain('flex-wrap')
    expect(pengguna).toContain('text-meta')
    expect(pengguna).not.toContain('RBAC')

    expect(verifikasi).toContain('DashboardPageHeader')
    expect(verifikasi).toContain('grid-cols-1 gap-3 text-sm sm:grid-cols-2')
  })
})
