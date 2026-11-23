import { describe, it, expect } from 'bun:test'
import {
  INITIAL_KEBUN_LIST,
  kebunFormSchema,
  validateKebunName,
  validateKebunLocation,
} from './kebun-switcher'
import { getDashboardActor } from './dashboard-navigation-data'

describe('KebunSwitcher logic and data', () => {
  it('provides standard initial kebun list for farmers', () => {
    expect(INITIAL_KEBUN_LIST.length).toBeGreaterThanOrEqual(2)
    const firstKebun = INITIAL_KEBUN_LIST[0]
    expect(firstKebun).toHaveProperty('id')
    expect(firstKebun).toHaveProperty('name')
    expect(firstKebun).toHaveProperty('location')
    expect(firstKebun).toHaveProperty('area')
    expect(firstKebun).toHaveProperty('commodity')
  })

  it('correctly discriminates farmer vs admin routes', () => {
    expect(getDashboardActor('/dashboard')).toBe('farmer')
    expect(getDashboardActor('/dashboard/komoditas')).toBe('farmer')
    expect(getDashboardActor('/dashboard/admin')).toBe('admin')
    expect(getDashboardActor('/dashboard/admin/verifikasi-petani')).toBe('admin')
  })

  it('allows prepending new kebun item to the list', () => {
    const list = [...INITIAL_KEBUN_LIST]
    const newItem = {
      id: 'kbn-test-01',
      name: 'Kebun Jagung Garut',
      location: 'Garut, Jawa Barat',
      area: '3.0 Ha',
      commodity: 'Jagung Manis',
    }
    const updated = [newItem, ...list]
    expect(updated.length).toBe(list.length + 1)
    expect(updated[0].name).toBe('Kebun Jagung Garut')
  })

  it('validates kebunFormSchema with valid input data', () => {
    const validData = {
      name: 'Kebun Stroberi Ciwidey',
      location: 'Ciwidey, Bandung',
      area: '2.0 Ha',
      commodity: 'Stroberi Manis',
    }
    const result = kebunFormSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Kebun Stroberi Ciwidey')
      expect(result.data.location).toBe('Ciwidey, Bandung')
    }
  })

  it('rejects empty or whitespace-only name and location', () => {
    const invalidData = {
      name: '   ',
      location: ' ',
      area: '',
      commodity: '',
    }
    const result = kebunFormSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('allows optional area and commodity with defaults', () => {
    const minimalData = {
      name: 'Lahan Cabai',
      location: 'Lembang',
      area: '',
      commodity: '',
    }
    const result = kebunFormSchema.safeParse(minimalData)
    expect(result.success).toBe(true)
  })

  it('validates field-level kebun name validator', () => {
    expect(validateKebunName({ value: '' })).toBe('Nama kebun minimal 2 karakter')
    expect(validateKebunName({ value: ' ' })).toBe('Nama kebun minimal 2 karakter')
    expect(validateKebunName({ value: 'A' })).toBe('Nama kebun minimal 2 karakter')
    expect(validateKebunName({ value: 'Kebun Lembang' })).toBeUndefined()
  })

  it('validates field-level kebun location validator', () => {
    expect(validateKebunLocation({ value: '' })).toBe('Lokasi kebun minimal 2 karakter')
    expect(validateKebunLocation({ value: ' ' })).toBe('Lokasi kebun minimal 2 karakter')
    expect(validateKebunLocation({ value: 'L' })).toBe('Lokasi kebun minimal 2 karakter')
    expect(validateKebunLocation({ value: 'Bandung Barat' })).toBeUndefined()
  })
})
