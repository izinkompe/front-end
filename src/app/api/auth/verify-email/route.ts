import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/env'
import { validateTrustedVerificationUrl } from '@/lib/auth/verify-email-url'
import { VerifyEmailUrlRequestSchema } from '@/types/api/auth'

export async function POST(request: NextRequest) {
  const token = request.cookies.get('pangantani_token')?.value
  if (!token) {
    return NextResponse.json(
      { message: 'Sesi autentikasi tidak ditemukan. Silakan masuk terlebih dahulu.' },
      { status: 401 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Payload JSON tidak valid' }, { status: 400 })
  }

  const parsedBody = VerifyEmailUrlRequestSchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json(
      { message: 'URL verifikasi tidak valid', details: parsedBody.error.format() },
      { status: 400 }
    )
  }

  const trustedApiUrl = env.API_URL || env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
  const check = validateTrustedVerificationUrl(parsedBody.data.verificationUrl, trustedApiUrl)
  if (!check.ok) {
    return NextResponse.json({ message: check.reason }, { status: 400 })
  }

  try {
    const upstream = await fetch(check.url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    const data = await upstream.json().catch(() => ({}))
    return NextResponse.json(data, { status: upstream.status })
  } catch {
    return NextResponse.json(
      { message: 'Gagal menghubungi server verifikasi email' },
      { status: 502 }
    )
  }
}
