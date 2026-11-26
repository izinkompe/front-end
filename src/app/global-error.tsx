'use client'

import { ErrorPageShell } from '@/components/shared/error-page-shell'
import { resolveErrorPreset } from '@/lib/data/error-presets'
import './globals.css'

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const variant = resolveErrorPreset(error)

  return (
    <html lang='id' className='h-full antialiased font-sans'>
      <body className='min-h-full flex flex-col font-sans text-base'>
        <ErrorPageShell variant={variant} withGlobalLayout={false} onRetry={reset} />
      </body>
    </html>
  )
}
