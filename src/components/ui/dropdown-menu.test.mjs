import { describe, it, expect } from 'bun:test'
import React from 'react'
import { renderToString } from 'react-dom/server'
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
} from './dropdown-menu'

describe('DropdownMenuLabel group context safety', () => {
  it('renders standalone DropdownMenuLabel without throwing MenuGroupContext missing error', () => {
    let html = ''
    expect(() => {
      html = renderToString(React.createElement(DropdownMenuLabel, null, 'Standalone Label'))
    }).not.toThrow()
    expect(html).toContain('Standalone Label')
    expect(html).toContain('data-slot="dropdown-menu-label"')
  })

  it('renders DropdownMenuLabel inside DropdownMenuGroup cleanly', () => {
    let html = ''
    expect(() => {
      html = renderToString(
        React.createElement(
          DropdownMenuGroup,
          null,
          React.createElement(DropdownMenuLabel, null, 'Grouped Label')
        )
      )
    }).not.toThrow()
    expect(html).toContain('Grouped Label')
    expect(html).toContain('data-slot="dropdown-menu-group"')
    expect(html).toContain('data-slot="dropdown-menu-label"')
  })

  it('renders DropdownMenuLabel inside DropdownMenuRadioGroup cleanly', () => {
    let html = ''
    expect(() => {
      html = renderToString(
        React.createElement(
          DropdownMenuRadioGroup,
          null,
          React.createElement(DropdownMenuLabel, null, 'Radio Group Label')
        )
      )
    }).not.toThrow()
    expect(html).toContain('Radio Group Label')
    expect(html).toContain('data-slot="dropdown-menu-radio-group"')
    expect(html).toContain('data-slot="dropdown-menu-label"')
  })

  it('renders DropdownMenu component wrapper without error', () => {
    let html = ''
    expect(() => {
      html = renderToString(React.createElement(DropdownMenu, null, 'Menu Root'))
    }).not.toThrow()
    expect(html).toContain('Menu Root')
  })
})
