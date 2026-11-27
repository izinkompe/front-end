'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BrandLogo } from '@/components/shared/brand-logo'
import { Button } from '@/components/ui/button'
import { useHydrated } from '@/hooks/use-hydrated'
import { DASHBOARD_COOKIES, isAuthRelaxed, parseUserRole } from '@/lib/auth/rbac'
import { ERROR_PRESETS, type ErrorPageAction, type ErrorVariant } from '@/lib/data/error-presets'

export interface ErrorPageShellProps {
  variant?: ErrorVariant
  code?: string
  title?: string
  description?: string
  primaryAction?: ErrorPageAction
  secondaryAction?: ErrorPageAction
  onRetry?: () => void
  withGlobalLayout?: boolean
  homeHref?: string
}

const fallbackFooterLinks = [
  { label: 'Pusat Informasi', href: '/pusat-informasi' },
  { label: 'Kebijakan Privasi', href: '/pusat-informasi?tab=kebijakan-privasi' },
  { label: 'Syarat & Ketentuan', href: '/pusat-informasi?tab=syarat' },
  { label: 'Aksesibilitas', href: '/pusat-informasi?tab=aksesibilitas' },
  { label: 'Kontak', href: '/pusat-informasi?tab=kontak' },
]

function readCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null
  const prefix = `${name}=`
  const entry = document.cookie.split('; ').find((item) => item.startsWith(prefix))
  if (!entry) return null
  return decodeURIComponent(entry.slice(prefix.length))
}

function resolveClientHomeHref(defaultHref: string): string {
  if (defaultHref !== '/') return defaultHref
  const sessionRole = parseUserRole(readCookieValue(DASHBOARD_COOKIES.sessionRole))
  if (sessionRole === 'farmer' || sessionRole === 'admin') {
    return '/dashboard'
  }
  if (isAuthRelaxed()) {
    const previewRole = parseUserRole(readCookieValue(DASHBOARD_COOKIES.previewRole))
    if (previewRole === 'farmer' || previewRole === 'admin') {
      return '/dashboard'
    }
  }
  return defaultHref
}

function ActionControl({
  action,
  variant = 'link',
}: {
  action: ErrorPageAction
  variant?: 'default' | 'link' | 'outline'
}) {
  if (action.href) {
    return (
      <Button variant={variant} nativeButton={false} render={<Link href={action.href} />}>
        {action.label}
      </Button>
    )
  }

  if (action.onClick) {
    return (
      <Button type='button' variant={variant} onClick={action.onClick}>
        {action.label}
      </Button>
    )
  }

  return null
}

function ErrorContent({
  code,
  title,
  description,
  primaryAction,
  secondaryAction,
  canGoBack,
  onGoBack,
}: {
  code?: string
  title: string
  description: string
  primaryAction?: ErrorPageAction
  secondaryAction?: ErrorPageAction
  canGoBack: boolean
  onGoBack: () => void
}) {
  return (
    <div className='mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6'>
      {code ? (
        <p className='text-6xl font-bold tabular-nums text-foreground sm:text-7xl'>{code}</p>
      ) : null}

      <h1 className='mt-3 type-h1 text-foreground'>{title}</h1>

      <p className='mt-4 max-w-md text-base leading-relaxed text-muted-foreground'>{description}</p>

      {primaryAction || secondaryAction || canGoBack ? (
        <div className='mt-6 flex flex-wrap items-center justify-center gap-3'>
          {canGoBack && (
            <Button type='button' variant='outline' onClick={onGoBack}>
              <ArrowLeft data-icon='inline-start' aria-hidden='true' />
              <span>Kembali</span>
            </Button>
          )}
          {primaryAction ? (
            <ActionControl
              action={primaryAction}
              variant={primaryAction.onClick ? 'default' : 'link'}
            />
          ) : null}
          {secondaryAction ? <ActionControl action={secondaryAction} variant='link' /> : null}
        </div>
      ) : null}
    </div>
  )
}

export function ErrorPageShell({
  variant = '500',
  code,
  title,
  description,
  primaryAction,
  secondaryAction,
  onRetry,
  homeHref = '/',
}: ErrorPageShellProps) {
  const hydrated = useHydrated()
  const resolvedHomeHref = hydrated ? resolveClientHomeHref(homeHref) : homeHref
  const canGoBack = hydrated && typeof window !== 'undefined' && window.history.length > 1

  const preset = ERROR_PRESETS[variant]
  const resolvedCode = code ?? preset.code
  const resolvedTitle = title ?? preset.title
  const resolvedDescription = description ?? preset.description

  const mapHomeAction = (action: ErrorPageAction | undefined): ErrorPageAction | undefined => {
    if (!action) return undefined
    if (action.href === '/') {
      return { ...action, href: resolvedHomeHref }
    }
    return action
  }

  const resolvedPrimaryAction: ErrorPageAction | undefined =
    primaryAction ??
    (preset.supportsRetry && onRetry
      ? { label: preset.primaryAction.label, onClick: onRetry }
      : preset.primaryAction.href
        ? mapHomeAction(preset.primaryAction)
        : { label: 'Kembali ke beranda', href: resolvedHomeHref })

  const mappedSecondary = mapHomeAction(preset.secondaryAction)
  const resolvedSecondaryAction =
    secondaryAction ??
    (mappedSecondary?.href === resolvedPrimaryAction?.href ? undefined : mappedSecondary)

  return (
    <div className='flex min-h-dvh flex-col bg-background text-foreground'>
      <header className='mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8'>
        <BrandLogo href={resolvedHomeHref} />
      </header>

      <main className='flex flex-1 flex-col'>
        <ErrorContent
          code={resolvedCode}
          title={resolvedTitle}
          description={resolvedDescription}
          primaryAction={resolvedPrimaryAction}
          secondaryAction={resolvedSecondaryAction}
          canGoBack={canGoBack}
          onGoBack={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              window.history.back()
            }
          }}
        />
      </main>

      <footer className='bg-secondary text-secondary-foreground'>
        <div className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <nav
              aria-label='Tautan Kebijakan'
              className='flex flex-wrap items-center gap-x-6 gap-y-2'
            >
              {fallbackFooterLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className='inline-flex min-h-10 items-center rounded-sm py-1.5 text-sm text-muted-foreground transition-colors pointer-coarse:min-h-11 hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <p className='text-sm text-muted-foreground'>Indonesia</p>
          </div>

          <div className='flex flex-col gap-1.5 text-sm leading-relaxed text-muted-foreground'>
            <p className='font-medium text-secondary-foreground'>PanganTani Indonesia</p>
            <p>
              &apos;PanganTani&apos; dan logo &apos;PanganTani&apos; merupakan merek dagang milik
              PanganTani Indonesia. Informasi produk, ketersediaan panen, dan transaksi mengikuti
              ketentuan layanan yang berlaku.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
