export type GeolocationFailureReason =
  'unsupported' | 'insecure_context' | 'permission_denied' | 'position_unavailable' | 'timeout'

export type GeolocationResult =
  | { ok: true; latitude: number; longitude: number }
  | { ok: false; reason: GeolocationFailureReason }

const DEFAULT_POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 12000,
  maximumAge: 300_000,
}

export function getGeolocationErrorMessage(
  reason: GeolocationFailureReason,
  context: 'buyer' | 'farmer' = 'buyer'
): string {
  if (context === 'farmer') {
    switch (reason) {
      case 'unsupported':
        return 'HP atau browser ini belum mendukung deteksi otomatis. Pilih wilayah di bawah.'
      case 'insecure_context':
        return 'Deteksi lokasi membutuhkan HTTPS atau localhost. Pilih wilayah di bawah.'
      case 'permission_denied':
        return 'Izin lokasi belum diaktifkan. Aktifkan di pengaturan browser atau pilih wilayah di bawah.'
      case 'timeout':
        return 'Waktu deteksi lokasi habis. Coba lagi atau pilih wilayah di bawah.'
      case 'position_unavailable':
        return 'Lokasi perangkat tidak tersedia saat ini. Pilih wilayah di bawah.'
    }
  }

  switch (reason) {
    case 'unsupported':
      return 'Browser tidak mendukung deteksi lokasi.'
    case 'insecure_context':
      return 'Deteksi lokasi membutuhkan HTTPS atau localhost. Pilih wilayah secara manual.'
    case 'permission_denied':
      return 'Izin lokasi ditolak. Aktifkan izin lokasi di browser atau pilih wilayah secara manual.'
    case 'timeout':
      return 'Waktu deteksi lokasi habis. Coba lagi atau pilih wilayah secara manual.'
    case 'position_unavailable':
      return 'Lokasi perangkat tidak tersedia saat ini. Pilih wilayah secara manual.'
  }
}

export async function queryGeolocationPermission(): Promise<PermissionState | null> {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
    return null
  }
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' })
    return status.state
  } catch {
    return null
  }
}

export function requestCurrentPosition(options?: PositionOptions): Promise<GeolocationResult> {
  if (typeof window !== 'undefined' && window.isSecureContext === false) {
    return Promise.resolve({ ok: false, reason: 'insecure_context' })
  }

  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve({ ok: false, reason: 'unsupported' })
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          ok: true,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        const code = error?.code
        if (code === 1) {
          resolve({ ok: false, reason: 'permission_denied' })
          return
        }
        if (code === 3) {
          resolve({ ok: false, reason: 'timeout' })
          return
        }
        resolve({ ok: false, reason: 'position_unavailable' })
      },
      { ...DEFAULT_POSITION_OPTIONS, ...options }
    )
  })
}
