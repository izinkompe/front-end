import { expect, test } from 'bun:test'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { Button, buttonVariants } from './button.tsx'

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

test('button safely defaults nativeButton to false when non-button render prop is provided', () => {
  const link = React.createElement('a', { href: '/test-route' }, 'Link Text')
  const html = renderToString(React.createElement(Button, { render: link }))

  expect(html).toContain('href="/test-route"')
  expect(html).toContain('role="button"')
  expect(html).toContain('tabindex="0"')
})
