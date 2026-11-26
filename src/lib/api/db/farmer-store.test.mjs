import { describe, expect, test } from 'bun:test'
import { tanstackDbAdapter } from './adapter'

describe('farmer store endpoints in tanstackDbAdapter', () => {
  test('returns sanitized public store profile without PII and filters offers by farmerId', async () => {
    const profile = await tanstackDbAdapter.dispatch('/api/farmers/usr-pt-01', {
      method: 'GET',
    })

    expect(profile.id).toBe('usr-pt-01')
    expect(profile.farmName).toBe('Kelompok Tani Subur Makmur')
    expect(profile.isVerifiedFarmer).toBe(true)
    expect('email' in profile).toBe(false)
    expect('phone' in profile).toBe(false)
    expect('bankAccount' in profile).toBe(false)
    expect('fullAddress' in profile).toBe(false)

    const offers = await tanstackDbAdapter.dispatch('/api/offers', {
      method: 'GET',
      params: { farmerId: 'usr-pt-01' },
    })

    expect(offers.length).toBeGreaterThanOrEqual(2)
    expect(offers.every((item) => item.farmerId === 'usr-pt-01')).toBe(true)
  })

  test('returns farmer reviews summary and toggles follow and helpful state', async () => {
    const reviewsPayload = await tanstackDbAdapter.dispatch('/api/farmers/usr-pt-01/reviews', {
      method: 'GET',
    })

    expect(reviewsPayload.summary.totalReviews).toBeGreaterThan(0)
    expect(reviewsPayload.reviews.length).toBe(reviewsPayload.summary.totalReviews)

    await expect(
      tanstackDbAdapter.dispatch('/api/farmers/usr-pt-01/follow', { method: 'POST' })
    ).rejects.toThrow()

    await tanstackDbAdapter.dispatch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'ratna@dapurkasih.org',
        password: 'password123',
      }),
    })

    const followed = await tanstackDbAdapter.dispatch('/api/farmers/usr-pt-01/follow', {
      method: 'POST',
    })
    expect(followed.isFollowing).toBe(true)

    const unfollowed = await tanstackDbAdapter.dispatch('/api/farmers/usr-pt-01/follow', {
      method: 'POST',
    })
    expect(unfollowed.isFollowing).toBe(false)

    const firstReviewId = reviewsPayload.reviews[0].id
    const initialHelpful = reviewsPayload.reviews[0].helpfulCount

    const markedHelpful = await tanstackDbAdapter.dispatch(
      `/api/reviews/${firstReviewId}/helpful`,
      { method: 'POST' }
    )
    expect(markedHelpful.isHelpfulByMe).toBe(true)
    expect(markedHelpful.helpfulCount).toBe(initialHelpful + 1)

    const unmarkedHelpful = await tanstackDbAdapter.dispatch(
      `/api/reviews/${firstReviewId}/helpful`,
      { method: 'POST' }
    )
    expect(unmarkedHelpful.isHelpfulByMe).toBe(false)
    expect(unmarkedHelpful.helpfulCount).toBe(initialHelpful)

    await tanstackDbAdapter.dispatch('/api/auth/logout', { method: 'POST' })
  })
})
