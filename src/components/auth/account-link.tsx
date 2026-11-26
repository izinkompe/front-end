'use client'

import { useContext, type ComponentProps } from 'react'
import Link from 'next/link'
import { BuyerAuthPromptContext } from '@/components/auth/buyer-auth-prompt-provider'

type AccountLinkProps = ComponentProps<typeof Link>

export function AccountLink({ href, onClick, ...props }: AccountLinkProps) {
  const authPrompt = useContext(BuyerAuthPromptContext)
  const targetHref = typeof href === 'string' ? href : (href.pathname ?? '/akun')

  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        if (authPrompt && !authPrompt.isAuthenticated) {
          event.preventDefault()
          authPrompt.openAuthForRoute(targetHref)
        }
      }}
      {...props}
    />
  )
}
