import Link from 'next/link'
import { Lock, Sprout } from 'lucide-react'
import { Progress, ProgressLabel } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface FarmerAuthShellProps {
  children: React.ReactNode
  step?: number
  totalSteps?: number
  stepLabel?: string
  width?: 'narrow' | 'wide'
}

export function FarmerAuthShell({
  children,
  step,
  totalSteps,
  stepLabel,
  width = 'narrow',
}: FarmerAuthShellProps) {
  const showProgress = typeof step === 'number' && typeof totalSteps === 'number' && totalSteps > 0
  const progressValue = showProgress ? Math.round((step / totalSteps) * 100) : 0

  return (
    <div className='flex min-h-dvh flex-col bg-background text-foreground'>
      <header className='w-full border-b border-border bg-background'>
        <div className='mx-auto flex h-16 max-w-5xl items-center justify-center px-4 sm:px-6'>
          <Link
            href='/'
            aria-label='Kembali ke beranda PanganTani'
            className='inline-flex items-center gap-2.5 rounded-lg px-2 py-1 transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            <span className='flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
              <Sprout className='size-4' aria-hidden='true' />
            </span>
            <span className='text-lg font-semibold tracking-tight text-foreground'>PanganTani</span>
          </Link>
        </div>
      </header>

      <main className='flex flex-1 flex-col items-center px-4 py-8 sm:px-6 sm:py-12'>
        <div
          className={cn('flex w-full flex-col gap-6', width === 'wide' ? 'max-w-3xl' : 'max-w-md')}
        >
          {showProgress && (
            <div className='mx-auto flex w-full max-w-md flex-col items-center gap-2 text-center'>
              <Progress
                value={progressValue}
                aria-label={`Progres pendaftaran langkah ${step} dari ${totalSteps}`}
                className='flex w-full flex-col items-center gap-2'
              >
                <ProgressLabel className='flex flex-col items-center gap-0.5 text-center text-muted-foreground tabular-nums'>
                  <span>
                    Langkah {step} dari {totalSteps}
                  </span>
                  {stepLabel && (
                    <span className='text-xs font-normal text-muted-foreground'>{stepLabel}</span>
                  )}
                </ProgressLabel>
              </Progress>
            </div>
          )}

          {children}
        </div>
      </main>

      <footer className='mt-auto w-full border-t border-border bg-background'>
        <div className='mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-5 text-xs text-muted-foreground sm:px-6'>
          <Link
            href='/privasi'
            className='rounded-sm underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            Kebijakan Privasi
          </Link>
          <Separator orientation='vertical' className='hidden h-3.5 sm:block' />
          <span className='inline-flex items-center gap-1.5 font-medium text-foreground/80'>
            <Lock className='size-3.5 text-primary' aria-hidden='true' />
            <span>Aman &amp; Terenkripsi</span>
          </span>
          <Separator orientation='vertical' className='hidden h-3.5 sm:block' />
          <Link
            href='/bantuan'
            className='rounded-sm underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            Butuh Bantuan?
          </Link>
        </div>
      </footer>
    </div>
  )
}
