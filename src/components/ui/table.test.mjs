import { expect, test } from 'bun:test'
import * as React from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  TableActionButtons,
  TanstackDbTable,
  formatCondition,
  formatStatus,
  formatCurrency,
} from './table'
import { offersCollection } from '../../lib/api/db'

test('exports all standard table primitives and TanStack DB helpers', () => {
  expect(typeof Table).toBe('function')
  expect(typeof TableHeader).toBe('function')
  expect(typeof TableBody).toBe('function')
  expect(typeof TableFooter).toBe('function')
  expect(typeof TableRow).toBe('function')
  expect(typeof TableHead).toBe('function')
  expect(typeof TableCell).toBe('function')
  expect(typeof TableCaption).toBe('function')
  expect(typeof TableActionButtons).toBe('function')
  expect(typeof TanstackDbTable).toBe('function')
})

test('formatters format condition, status, and IDR currency properly', () => {
  expect(formatCondition('grade_b')).toBe('Grade B')
  expect(formatCondition('surplus')).toBe('Surplus')
  expect(formatCondition('imperfect_shape')).toBe('Bentuk Unik')
  expect(formatCondition('ripe_urgent')).toBe('Matang Segera')

  expect(formatStatus('active')).toBe('Aktif')
  expect(formatStatus('sold_out')).toBe('Habis')
  expect(formatStatus('draft')).toBe('Draf')
  expect(formatStatus('closed')).toBe('Ditutup')
  expect(formatStatus('expired')).toBe('Kedaluwarsa')

  expect(formatCurrency(14000)).toContain('14.000')
})

test('TanStack DB offers collection provides valid initial data', () => {
  const initialOffers = offersCollection.toArray
  expect(initialOffers.length).toBeGreaterThan(0)

  const firstOffer = initialOffers[0]
  expect(firstOffer.id).toBeDefined()
  expect(firstOffer.commodityName).toBeDefined()
  expect(firstOffer.availableStockKg).toBeGreaterThanOrEqual(0)
  expect(firstOffer.pricePerKg).toBeGreaterThan(0)
})

test('TableActionButtons invokes onDelete, onInfo, and onEdit callbacks', () => {
  const dummyItem = { id: 'test-1' }
  let deleted = false
  let infoSeen = false
  let edited = false

  const element = React.createElement(TableActionButtons, {
    item: dummyItem,
    onDelete: () => {
      deleted = true
    },
    onInfo: () => {
      infoSeen = true
    },
    onEdit: () => {
      edited = true
    },
  })

  expect(element.props.item).toBe(dummyItem)
  element.props.onDelete(dummyItem)
  element.props.onInfo(dummyItem)
  element.props.onEdit(dummyItem)

  expect(deleted).toBe(true)
  expect(infoSeen).toBe(true)
  expect(edited).toBe(true)
})
