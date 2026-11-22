import { expect, test } from 'bun:test'
import { buttonVariants } from './button.tsx'

test('button uses the default variant and size', () => {
  const classes = buttonVariants().split(' ')

  expect(classes).toContain('bg-primary')
  expect(classes).toContain('h-8')
})

test('button applies a custom variant and size', () => {
  const classes = buttonVariants({ variant: 'destructive', size: 'lg' }).split(' ')

  expect(classes).toContain('bg-destructive/10')
  expect(classes).toContain('h-9')
  expect(classes).not.toContain('bg-primary')
  expect(classes).not.toContain('h-8')
})
