'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { sanitizeCallbackUrl } from '@/lib/auth/rbac'

interface BuyerAuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthenticated?: () => void
  defaultTab?: 'login' | 'register'
}

export function BuyerAuthDialog({
  open,
  onOpenChange,
  defaultTab = 'login',
}: BuyerAuthDialogProps) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!open) return
    onOpenChange(false)
    const targetBase = defaultTab === 'register' ? '/daftar' : '/masuk'
    const nextUrl = sanitizeCallbackUrl(pathname, '/')
    router.push(`${targetBase}?next=${encodeURIComponent(nextUrl)}`)
  }, [open, defaultTab, pathname, router, onOpenChange])

  return null
}
