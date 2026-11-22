import { expect, test } from 'bun:test'
import { badgeVariants } from './badge.tsx'

test('badge uses the default variant and size', () => {
  const classes = badgeVariants().split(' ')

  expect(classes).toContain('bg-primary')
  expect(classes).toContain('h-5')
})

test('badge applies custom variant and size', () => {
  const classes = badgeVariants({ variant: 'success', size: 'sm' }).split(' ')

  expect(classes).toContain('bg-emerald-500/15')
  expect(classes).toContain('h-4')
  expect(classes).not.toContain('bg-primary')
  expect(classes).not.toContain('h-5')
})

test('badge applies warning and destructive variants', () => {
  const warningClasses = badgeVariants({ variant: 'warning' }).split(' ')
  const destructiveClasses = badgeVariants({ variant: 'destructive' }).split(' ')

  expect(warningClasses).toContain('bg-amber-500/15')
  expect(destructiveClasses).toContain('bg-destructive/10')
})
