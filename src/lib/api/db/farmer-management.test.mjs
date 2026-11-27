import { describe, expect, test } from 'bun:test'
import { tanstackDbAdapter } from './adapter'

describe('farmer dashboard data management routes', () => {
  test('enforces farmer verification lock on publishing offers and responding to needs board', async () => {
    await tanstackDbAdapter.dispatch('/api/auth/logout', { method: 'POST' })

    const unverifiedRegister = await tanstackDbAdapter.dispatch('/api/auth/register-farmer', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Petani Baru Uji',
        email: `petani-uji-${Date.now()}@pangantani.id`,
        phone: '081234567899',
        farmName: 'Kebun Uji Verifikasi',
        farmerType: 'individual',
        primaryCommodities: ['sayuran'],
        areaName: 'Lembang, Bandung Barat',
        fullAddress: 'Jl. Pertanian No. 12, Lembang',
        latitude: -6.8167,
        longitude: 107.6167,
        bankAccount: {
          bankName: 'BRI',
          accountNumber: '1234567890',
          accountHolderName: 'Petani Baru Uji',
        },
      }),
    })
    expect(unverifiedRegister.user.isVerifiedFarmer).toBe(false)

    const farms = await tanstackDbAdapter.dispatch('/api/farmer/farms', { method: 'GET' })
    expect(farms.length).toBeGreaterThanOrEqual(1)

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const draftOffer = await tanstackDbAdapter.dispatch('/api/farmer/offers', {
      method: 'POST',
      body: JSON.stringify({
        farmId: farms[0].id,
        commodityName: 'Bayam Merah Segar',
        category: 'sayuran',
        condition: 'surplus',
        harvestDate: new Date().toISOString(),
        availableStockKg: 15,
        pricePerKg: 8000,
        orderDeadline: tomorrow,
        pickupScheduleSlots: [
          {
            id: 'slot-uji-1',
            date: tomorrow.slice(0, 10),
            startTime: '08:00',
            endTime: '11:00',
            isAvailable: true,
          },
        ],
        status: 'draft',
      }),
    })
    expect(draftOffer.status).toBe('draft')

    await expect(
      tanstackDbAdapter.dispatch('/api/farmer/offers', {
        method: 'POST',
        body: JSON.stringify({
          farmId: farms[0].id,
          commodityName: 'Bayam Hijau',
          category: 'sayuran',
          condition: 'surplus',
          harvestDate: new Date().toISOString(),
          availableStockKg: 15,
          pricePerKg: 8000,
          orderDeadline: tomorrow,
          pickupScheduleSlots: [
            {
              id: 'slot-uji-2',
              date: tomorrow.slice(0, 10),
              startTime: '08:00',
              endTime: '11:00',
              isAvailable: true,
            },
          ],
          status: 'active',
        }),
      })
    ).rejects.toThrow()

    await expect(
      tanstackDbAdapter.dispatch('/api/needs-board/need-002/responses', {
        method: 'POST',
        body: JSON.stringify({
          offerId: draftOffer.id,
          offeredQuantityKg: 10,
          offeredPricePerKg: 8000,
          availableDate: tomorrow.slice(0, 10),
        }),
      })
    ).rejects.toThrow()

    await tanstackDbAdapter.dispatch('/api/auth/logout', { method: 'POST' })
  })

  test('supports full store, farm, offer, order, and needs board management for verified farmer', async () => {
    await tanstackDbAdapter.dispatch('/api/auth/login-farmer', {
      method: 'POST',
      body: JSON.stringify({
        email: 'joko@suburmakmur.id',
        password: 'PetaniJoko2026!',
      }),
    })

    const updatedBank = await tanstackDbAdapter.dispatch('/api/farmer/bank-account', {
      method: 'PATCH',
      body: JSON.stringify({
        bankName: 'BCA',
        accountNumber: '8877665544',
        accountHolderName: 'Joko Susilo',
      }),
    })
    expect(updatedBank.bankName).toBe('BCA')

    const featuredStore = await tanstackDbAdapter.dispatch('/api/farmer/store/featured', {
      method: 'PATCH',
      body: JSON.stringify({
        offerId: 'off-001',
        featured: true,
      }),
    })
    expect(featuredStore.featuredOfferIds).toContain('off-001')

    const reviews = await tanstackDbAdapter.dispatch('/api/farmer/reviews', { method: 'GET' })
    expect(reviews.length).toBeGreaterThan(0)
    const replied = await tanstackDbAdapter.dispatch(`/api/farmer/reviews/${reviews[0].id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message: 'Terima kasih atas ulasannya.' }),
    })
    expect(replied.farmerReply.message).toBe('Terima kasih atas ulasannya.')

    const farms = await tanstackDbAdapter.dispatch('/api/farmer/farms', { method: 'GET' })
    await expect(
      tanstackDbAdapter.dispatch(`/api/farmer/farms/${farms[0].id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: farms[0].name,
          areaName: farms[0].areaName,
          fullAddress: farms[0].fullAddress,
          primaryCommodities: ['sayuran'],
          status: 'archived',
        }),
      })
    ).rejects.toThrow()

    const adjustedOffer = await tanstackDbAdapter.dispatch(
      '/api/farmer/offers/off-001/stock-adjustment',
      {
        method: 'POST',
        body: JSON.stringify({
          availableStockKg: 82.5,
          condition: 'grade_b',
          conditionNote: 'Sortir ulang pagi hari',
        }),
      }
    )
    expect(adjustedOffer.availableStockKg).toBe(82.5)

    const nextDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const proposedOrder = await tanstackDbAdapter.dispatch(
      '/api/farmer/orders/ord-demo-006/schedule-proposal',
      {
        method: 'POST',
        body: JSON.stringify({
          date: nextDate,
          startTime: '14:00',
          endTime: '16:00',
          reason: 'Menyesuaikan jadwal petik sore hari.',
        }),
      }
    )
    expect(proposedOrder.scheduleProposalStatus).toBe('pending')

    const restockedOrder = await tanstackDbAdapter.dispatch(
      '/api/farmer/orders/ord-demo-007/restock-decision',
      {
        method: 'POST',
        body: JSON.stringify({
          decision: 'restocked',
          note: 'Masih segar di ruang sejuk',
        }),
      }
    )
    expect(restockedOrder.restockDecision).toBe('restocked')

    const complaints = await tanstackDbAdapter.dispatch('/api/farmer/complaints', { method: 'GET' })
    expect(complaints.length).toBeGreaterThan(0)
    const updatedComplaint = await tanstackDbAdapter.dispatch(
      `/api/farmer/complaints/${complaints[0].id}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({
          message: 'Foto timbangan ulang terlampir.',
        }),
      }
    )
    expect(updatedComplaint.clarificationMessages.at(-1).senderRole).toBe('farmer')

    const respondedNeed = await tanstackDbAdapter.dispatch('/api/needs-board/need-003/responses', {
      method: 'POST',
      body: JSON.stringify({
        offerId: 'off-003',
        offeredQuantityKg: 10,
        offeredPricePerKg: 12000,
        availableDate: nextDate,
        message: 'Siap ambil di Lembang.',
      }),
    })
    const createdResp = respondedNeed.responses.find((r) => r.farmerId === 'usr-pt-01')
    expect(createdResp).toBeDefined()

    const withdrawnNeed = await tanstackDbAdapter.dispatch(
      `/api/needs-board/need-003/responses/${createdResp.id}`,
      { method: 'DELETE' }
    )
    expect(withdrawnNeed.responses.some((r) => r.id === createdResp.id)).toBe(false)

    await tanstackDbAdapter.dispatch('/api/auth/logout', { method: 'POST' })
  })
})
