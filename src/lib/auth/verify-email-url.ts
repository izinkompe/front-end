export function validateTrustedVerificationUrl(
  rawUrl: string,
  trustedBaseApiUrl: string
): { ok: true; url: string } | { ok: false; reason: string } {
  let parsed: URL
  let expected: URL
  try {
    parsed = new URL(rawUrl)
    expected = new URL(trustedBaseApiUrl)
  } catch {
    return { ok: false, reason: 'Format URL verifikasi tidak valid' }
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, reason: 'Protokol URL verifikasi tidak diizinkan' }
  }

  if (parsed.origin !== expected.origin) {
    return { ok: false, reason: 'Origin URL verifikasi tidak dipercaya' }
  }

  const basePath = expected.pathname.replace(/\/+$/, '')
  const requiredPrefix = `${basePath}/auth/email/verify/`
  if (!parsed.pathname.startsWith(requiredPrefix)) {
    return { ok: false, reason: 'Path URL verifikasi tidak valid' }
  }

  return { ok: true, url: parsed.toString() }
}
