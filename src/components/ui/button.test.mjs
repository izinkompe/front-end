import { expect, test } from 'bun:test'
import { buttonVariants } from './button.tsx'

test('button uses the default variant and accessible target size', () => {
  const classes = buttonVariants().split(' ')

  expect(classes).toContain('bg-primary')
  expect(classes).toContain('min-h-11')
  expect(classes).toContain('text-base')
})

test('button applies a custom variant and size', () => {
  const classes = buttonVariants({ variant: 'destructive', size: 'lg' }).split(' ')

  expect(classes).toContain('bg-destructive/10')
  expect(classes).toContain('min-h-12')
  expect(classes).not.toContain('bg-primary')
  expect(classes).not.toContain('min-h-11')
})

test('icon button maintains minimum click and touch target size', () => {
  const classes = buttonVariants({ variant: 'ghost', size: 'icon' }).split(' ')

  expect(classes).toContain('min-h-11')
  expect(classes).toContain('min-w-11')
})
