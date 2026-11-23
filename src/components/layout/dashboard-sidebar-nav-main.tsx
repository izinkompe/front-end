'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export interface NavMainItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  defaultOpen?: boolean
  items?: {
    title: string
    url: string
    isActive?: boolean
  }[]
}

interface NavMainProps {
  label?: string
  items: NavMainItem[]
}

function NavCollapsible({ item }: { item: NavMainItem }) {
  const [isOpen, setIsOpen] = React.useState(item.defaultOpen ?? true)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className='group/collapsible w-full'>
      <CollapsibleTrigger
        render={<SidebarMenuButton tooltip={item.title} isActive={item.isActive} />}
      >
        {item.icon && <item.icon />}
        <span>{item.title}</span>
        <ChevronRight
          className={cn(
            'ml-auto size-4 transition-transform duration-200',
            isOpen ? 'rotate-90' : 'rotate-0'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.items?.map((subItem) => (
            <SidebarMenuSubItem key={subItem.title}>
              <SidebarMenuSubButton
                isActive={subItem.isActive}
                render={<Link href={subItem.url} />}
              >
                <span>{subItem.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function NavMain({ label = 'Menu Navigasi', items }: NavMainProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = Boolean(item.items && item.items.length > 0)

          return (
            <SidebarMenuItem key={item.title}>
              {hasChildren ? (
                <NavCollapsible item={item} />
              ) : (
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={item.isActive}
                  render={<Link href={item.url} />}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
