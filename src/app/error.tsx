'use client'

import { ErrorPageShell } from '@/components/shared/error-page-shell'
import { resolveErrorPreset } from '@/lib/data/error-presets'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const variant = resolveErrorPreset(error)
  return <ErrorPageShell variant={variant} onRetry={reset} />
}
