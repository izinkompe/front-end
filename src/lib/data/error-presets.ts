export type ErrorVariant =
  '400' | '401' | '403' | '404' | '408' | 'session-expired' | '429' | '500' | '503' | 'offline'

export interface ErrorPageAction {
  label: string
  href?: string
  onClick?: () => void
}

export interface ErrorPresetConfig {
  code: string
  title: string
  description: string
  primaryAction: ErrorPageAction
  secondaryAction?: ErrorPageAction
  supportsRetry?: boolean
}

export const ERROR_PRESETS: Record<ErrorVariant, ErrorPresetConfig> = {
  '400': {
    code: '400',
    title: 'Permintaan tidak valid',
    description:
      'Data atau tautan yang dikirim tidak sesuai format. Periksa kembali lalu ulangi permintaan.',
    primaryAction: { label: 'Kembali ke beranda', href: '/' },
  },
  '401': {
    code: '401',
    title: 'Belum masuk akun',
    description:
      'Anda harus masuk terlebih dahulu untuk mengakses halaman ini. Gunakan menu masuk di bagian atas atau kembali ke beranda.',
    primaryAction: { label: 'Kembali ke beranda', href: '/' },
    secondaryAction: { label: 'Masuk Petani', href: '/masuk-petani' },
  },
  '403': {
    code: '403',
    title: 'Akses ditolak',
    description: 'Akun Anda tidak memiliki kredensial atau izin peran untuk membuka halaman ini.',
    primaryAction: { label: 'Kembali ke beranda', href: '/' },
    secondaryAction: { label: 'Pusat Informasi', href: '/pusat-informasi' },
  },
  '404': {
    code: '404',
    title: 'Halaman tidak ditemukan',
    description: 'Halaman yang Anda cari tidak tersedia atau telah dipindahkan.',
    primaryAction: { label: 'Kembali ke beranda', href: '/' },
  },
  '408': {
    code: '408',
    title: 'Waktu permintaan habis',
    description: 'Server membutuhkan waktu terlalu lama untuk merespons. Coba muat ulang halaman.',
    primaryAction: { label: 'Coba lagi' },
    secondaryAction: { label: 'Kembali ke beranda', href: '/' },
    supportsRetry: true,
  },
  'session-expired': {
    code: '401',
    title: 'Sesi telah berakhir',
    description:
      'Sesi masuk Anda sudah kedaluwarsa demi keamanan akun. Masuk kembali untuk melanjutkan.',
    primaryAction: { label: 'Kembali ke beranda', href: '/' },
    secondaryAction: { label: 'Masuk Petani', href: '/masuk-petani' },
  },
  '429': {
    code: '429',
    title: 'Terlalu banyak permintaan',
    description:
      'Anda mengirim terlalu banyak permintaan dalam waktu singkat. Tunggu beberapa saat sebelum mencoba lagi.',
    primaryAction: { label: 'Coba lagi' },
    secondaryAction: { label: 'Kembali ke beranda', href: '/' },
    supportsRetry: true,
  },
  '500': {
    code: '500',
    title: 'Terjadi kendala pada halaman',
    description:
      'Permintaan tidak dapat diproses saat ini. Muat ulang halaman atau kembali ke beranda.',
    primaryAction: { label: 'Coba lagi' },
    secondaryAction: { label: 'Kembali ke beranda', href: '/' },
    supportsRetry: true,
  },
  '503': {
    code: '503',
    title: 'Layanan sedang tidak tersedia',
    description:
      'Sistem sedang dalam pemeliharaan atau mengalami gangguan sementara. Coba beberapa saat lagi.',
    primaryAction: { label: 'Coba lagi' },
    secondaryAction: { label: 'Kembali ke beranda', href: '/' },
    supportsRetry: true,
  },
  offline: {
    code: 'Offline',
    title: 'Koneksi internet terputus',
    description: 'Periksa sambungan internet perangkat Anda lalu coba muat ulang halaman.',
    primaryAction: { label: 'Coba lagi' },
    secondaryAction: { label: 'Kembali ke beranda', href: '/' },
    supportsRetry: true,
  },
}

interface ErrorLike {
  status?: unknown
  code?: unknown
  message?: unknown
  name?: unknown
}

export function resolveErrorPreset(error?: unknown): ErrorVariant {
  if (!error || typeof error !== 'object') {
    return '500'
  }

  const candidate = error as ErrorLike
  const status = typeof candidate.status === 'number' ? candidate.status : undefined
  const code = typeof candidate.code === 'string' ? candidate.code.toUpperCase() : undefined
  const message = typeof candidate.message === 'string' ? candidate.message.toLowerCase() : ''

  if (code === 'SESSION_EXPIRED' || code === 'TOKEN_EXPIRED') {
    return 'session-expired'
  }
  if (status === 400) return '400'
  if (status === 401 || code === 'UNAUTHORIZED' || code === 'UNAUTHENTICATED') return '401'
  if (status === 403 || code === 'FORBIDDEN') return '403'
  if (status === 404 || code === 'NOT_FOUND') return '404'
  if (status === 408 || code === 'TIMEOUT') return '408'
  if (status === 429 || code === 'RATE_LIMITED' || code === 'TOO_MANY_REQUESTS') return '429'
  if (status === 503 || code === 'SERVICE_UNAVAILABLE' || code === 'MAINTENANCE') return '503'

  if (
    candidate.name === 'NetworkError' ||
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('network request failed')
  ) {
    return 'offline'
  }

  return '500'
}
