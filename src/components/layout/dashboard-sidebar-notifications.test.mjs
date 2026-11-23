import { describe, it, expect } from 'bun:test'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SidebarProvider } from '@/components/ui/sidebar'
import { DashboardSidebarNotifications } from './dashboard-sidebar-notifications'
import { mockNotificationsData } from '@/lib/api/db/fixtures/notifications.fixture'

describe('DashboardSidebarNotifications data and logic', () => {
  it('correctly filters notifications for farmer actor', () => {
    const farmerNotifs = mockNotificationsData.filter((item) => item.userId === 'usr-pt-01')
    expect(farmerNotifs.length).toBeGreaterThanOrEqual(2)
    const unread = farmerNotifs.filter((n) => !n.isRead)
    expect(unread.length).toBe(2)
    expect(farmerNotifs.some((n) => n.title === 'Pesanan Baru Masuk')).toBe(true)
  })

  it('correctly filters notifications for admin actor', () => {
    const adminNotifs = mockNotificationsData.filter((item) => item.userId === 'usr-admin-01')
    expect(adminNotifs.length).toBeGreaterThanOrEqual(2)
    const unread = adminNotifs.filter((n) => !n.isRead)
    expect(unread.length).toBe(2)
    expect(adminNotifs.some((n) => n.title === 'Verifikasi Bukti Transfer')).toBe(true)
  })

  it('provides appropriate action links and types for each notification', () => {
    const ptOrderNotif = mockNotificationsData.find((n) => n.id === 'notif-pt-01')
    expect(ptOrderNotif?.link).toBe('/dashboard/pesanan')
    expect(ptOrderNotif?.type).toBe('order_update')

    const adPaymentNotif = mockNotificationsData.find((n) => n.id === 'notif-ad-01')
    expect(adPaymentNotif?.link).toBe('/dashboard/admin/verifikasi-pembayaran')
    expect(adPaymentNotif?.type).toBe('payment_reminder')
  })

  it('renders DashboardSidebarNotifications within QueryClient and SidebarProvider without throwing', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    let html = ''
    expect(() => {
      html = renderToString(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(
            SidebarProvider,
            null,
            React.createElement(DashboardSidebarNotifications, {
              userId: 'usr-pt-01',
              actor: 'farmer',
            })
          )
        )
      )
    }).not.toThrow()

    expect(html).toContain('Pemberitahuan')
    expect(html).toContain('data-sidebar="menu-button"')
  })

  it('renders Tabs, TabsList, and TabsTrigger for notification filter cleanly', () => {
    const { Tabs, TabsList, TabsTrigger } = require('@/components/ui/tabs')
    const html = renderToString(
      React.createElement(
        Tabs,
        { value: 'all' },
        React.createElement(
          TabsList,
          null,
          React.createElement(TabsTrigger, { value: 'all' }, 'Semua (3)'),
          React.createElement(TabsTrigger, { value: 'unread' }, 'Belum Dibaca (2)')
        )
      )
    )

    expect(html).toContain('data-slot="tabs"')
    expect(html).toContain('data-slot="tabs-list"')
    expect(html).toContain('data-slot="tabs-trigger"')
    expect(html).toContain('Semua (3)')
    expect(html).toContain('Belum Dibaca (2)')
  })
})
