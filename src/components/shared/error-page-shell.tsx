import Link from 'next/link'
import { GlobalLayout } from '@/components/layout/global-layout'
import { BrandLogo } from '@/components/shared/brand-logo'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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

function ActionControl({
  action,
  variant = 'link',
}: {
  action: ErrorPageAction
  variant?: 'default' | 'link'
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
}: {
  code?: string
  title: string
  description: string
  primaryAction?: ErrorPageAction
  secondaryAction?: ErrorPageAction
}) {
  return (
    <div className='mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6'>
      {code ? (
        <p className='text-6xl font-bold tabular-nums text-foreground sm:text-7xl'>{code}</p>
      ) : null}

      <h1 className='mt-3 type-h1 text-foreground'>{title}</h1>

      <p className='mt-4 max-w-md text-base leading-relaxed text-muted-foreground'>{description}</p>

      {primaryAction || secondaryAction ? (
        <div className='mt-6 flex flex-wrap items-center justify-center gap-3'>
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
  withGlobalLayout = true,
  homeHref = '/',
}: ErrorPageShellProps) {
  const preset = ERROR_PRESETS[variant]
  const resolvedCode = code ?? preset.code
  const resolvedTitle = title ?? preset.title
  const resolvedDescription = description ?? preset.description

  const resolvedPrimaryAction: ErrorPageAction | undefined =
    primaryAction ??
    (preset.supportsRetry && onRetry
      ? { label: preset.primaryAction.label, onClick: onRetry }
      : preset.primaryAction.href
        ? preset.primaryAction
        : { label: 'Kembali ke beranda', href: homeHref })

  const resolvedSecondaryAction =
    secondaryAction ??
    (preset.secondaryAction?.href === resolvedPrimaryAction.href
      ? undefined
      : preset.secondaryAction)

  if (withGlobalLayout) {
    return (
      <GlobalLayout>
        <ErrorContent
          code={resolvedCode}
          title={resolvedTitle}
          description={resolvedDescription}
          primaryAction={resolvedPrimaryAction}
          secondaryAction={resolvedSecondaryAction}
        />
      </GlobalLayout>
    )
  }

  return (
    <div className='flex min-h-dvh flex-col bg-background text-foreground'>
      <header className='mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8'>
        <BrandLogo href={homeHref} />
      </header>

      <main className='flex flex-1 flex-col'>
        <ErrorContent
          code={resolvedCode}
          title={resolvedTitle}
          description={resolvedDescription}
          primaryAction={resolvedPrimaryAction}
          secondaryAction={resolvedSecondaryAction}
        />
      </main>

      <footer className='bg-secondary text-secondary-foreground'>
        <div className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8'>
          <Separator />

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

          <div className='flex flex-col gap-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm'>
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
