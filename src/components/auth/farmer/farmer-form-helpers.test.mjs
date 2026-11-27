import { describe, expect, test } from 'bun:test'
import {
  OTHER_BANK_VALUE,
  bankOptions,
  formatBankNameInput,
  getBankOptionLabel,
  isCustomBankName,
  isPresetBankName,
  normalizeBankName,
} from './farmer-form-helpers'

describe('farmer bank form helpers', () => {
  test('includes Others option in bankOptions', () => {
    const otherOption = bankOptions.find((option) => option.value === OTHER_BANK_VALUE)
    expect(otherOption).toEqual({ value: 'OTHER', label: 'Lainnya (Others)' })
  })

  test('distinguishes preset bank names from custom bank names', () => {
    expect(isPresetBankName('BRI')).toBe(true)
    expect(isPresetBankName('BCA')).toBe(true)
    expect(isPresetBankName('OTHER')).toBe(false)
    expect(isPresetBankName('Bank Permata')).toBe(false)

    expect(isCustomBankName('')).toBe(false)
    expect(isCustomBankName('   ')).toBe(false)
    expect(isCustomBankName('BRI')).toBe(false)
    expect(isCustomBankName('Bank CIMB Niaga')).toBe(true)
  })

  test('resolves bank option labels and formats bank name input', () => {
    expect(getBankOptionLabel('BRI')).toBe('Bank BRI')
    expect(getBankOptionLabel(OTHER_BANK_VALUE)).toBe('Lainnya (Others)')
    expect(getBankOptionLabel('Bank Permata')).toBe('Bank Permata')

    expect(formatBankNameInput('  Bank   CIMB  Niaga ')).toBe('Bank CIMB Niaga ')
    expect(normalizeBankName('  Bank   CIMB   Niaga  ')).toBe('Bank CIMB Niaga')
  })
})
