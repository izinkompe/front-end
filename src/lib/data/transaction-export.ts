import type { Order } from '@/types/api/orders'

export function getCompletedTransactions(orders: Order[]) {
  return Array.from(
    new Map(
      orders.filter((order) => order.status === 'completed').map((order) => [order.id, order])
    ).values()
  )
}

export function summarizeCompletedTransactions(orders: Order[]) {
  const completed = getCompletedTransactions(orders)
  const grams = completed.reduce(
    (sum, order) => sum + Math.round((order.confirmedWeightKg ?? order.quantityKg) * 1000),
    0
  )
  return {
    weightKg: grams / 1000,
    totalIdr: completed.reduce((sum, order) => sum + order.totalPrice, 0),
    farmerCount: new Set(completed.map((order) => order.farmerId)).size,
    count: completed.length,
  }
}

function encodeCsvCell(value: string | number) {
  const text = String(value)
  const safe =
    typeof value === 'string' && /^(?:[\t\r\n]|[\s\u200B]*[=+\-@])/u.test(text) ? "'" + text : text
  return '"' + safe.replaceAll('"', '""') + '"'
}

export function buildTransactionsCsv(
  orders: Order[],
  meta: { from: string; to: string; createdAt: string }
) {
  const rows: Array<Array<string | number>> = [
    ['Dari tanggal', meta.from],
    ['Sampai tanggal', meta.to],
    ['Waktu ekspor', meta.createdAt],
    ['Satuan berat', 'kg'],
    ['Mata uang', 'IDR'],
    [],
    [
      'Nomor pesanan',
      'Tanggal pesanan',
      'Komoditas',
      'Petani',
      'Berat diterima (kg)',
      'Total belanja (IDR)',
    ],
    ...getCompletedTransactions(orders).map((order) => [
      order.id,
      order.createdAt,
      order.commodityName,
      order.farmerName ?? '',
      order.confirmedWeightKg ?? order.quantityKg,
      order.totalPrice,
    ]),
  ]
  return '\ufeff' + rows.map((row) => row.map(encodeCsvCell).join(',')).join('\r\n') + '\r\n'
}
