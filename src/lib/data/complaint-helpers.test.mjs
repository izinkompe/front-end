import { describe, expect, it } from 'bun:test'
import {
  canReportOrder,
  isPostPaymentCancelable,
  validateComplaintDescription,
  validateComplaintFiles,
  validateRefundBankField,
} from './complaint-helpers'

describe('complaint-helpers', () => {
  it('validates complaint description and refund bank fields', () => {
    expect(validateComplaintDescription('abc', false)).toContain('minimal 5 karakter')
    expect(validateComplaintDescription('abc', true)).toContain('pembatalan minimal 5 karakter')
    expect(validateComplaintDescription('Buah pecah saat ditimbang', false)).toBeNull()

    expect(validateRefundBankField('bankName', 'B')).toContain('minimal 2')
    expect(validateRefundBankField('bankName', 'BRI')).toBeNull()

    expect(validateRefundBankField('accountNumber', '1234')).toContain('5 sampai 24')
    expect(validateRefundBankField('accountNumber', '1234567890')).toBeNull()

    expect(validateRefundBankField('accountHolderName', 'A')).toContain('minimal 2')
    expect(validateRefundBankField('accountHolderName', 'Ibu Ratna')).toBeNull()
  })

  it('validates complaint photo limits and order reporting eligibility', () => {
    const file = new File(['abc'], 'foto.jpg', { type: 'image/jpeg' })
    expect(validateComplaintFiles([file, file, file])).toBeNull()
    expect(validateComplaintFiles([file, file, file, file])).toContain('maksimal 3')

    expect(isPostPaymentCancelable('payment_submitted')).toBe(true)
    expect(isPostPaymentCancelable('processing')).toBe(true)
    expect(isPostPaymentCancelable('ready_for_pickup')).toBe(true)
    expect(isPostPaymentCancelable('completed')).toBe(false)

    expect(canReportOrder('completed')).toBe(true)
    expect(canReportOrder('cancelled')).toBe(false)
  })
})
