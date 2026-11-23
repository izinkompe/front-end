import { describe, it, expect } from 'bun:test'
import { farmerProfile, adminProfile } from './dashboard-navigation-data'

describe('dashboard-sidebar-nav-user profile data', () => {
  it('supplies complete actor profile details for farmer', () => {
    expect(farmerProfile.name).toBe('Budi Santoso')
    expect(farmerProfile.email).toBe('budi@tani.id')
    expect(farmerProfile.initials).toBe('BS')
    expect(farmerProfile.badgeVariant).toBe('success')
    expect(farmerProfile.roleTitle).toBe('Petani Mitra')
    expect(farmerProfile.organization).toBeDefined()
  })

  it('supplies complete actor profile details for admin', () => {
    expect(adminProfile.name).toBe('Siti Rahma')
    expect(adminProfile.email).toBe('admin@pangantani.id')
    expect(adminProfile.initials).toBe('SR')
    expect(adminProfile.badgeVariant).toBe('info')
    expect(adminProfile.roleTitle).toBe('Administrator')
    expect(adminProfile.organization).toBeDefined()
  })

  it('correctly discriminates farmer badge from admin badge', () => {
    expect(farmerProfile.badgeVariant === 'success').toBe(true)
    expect(adminProfile.badgeVariant === 'success').toBe(false)
  })
})
