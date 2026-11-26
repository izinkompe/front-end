import type { MetadataRoute } from 'next'
import { buildAbsoluteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/akun/',
          '/pasar/checkout',
          '/pesanan/',
          '/favorit',
          '/masuk-petani',
          '/daftar-petani',
          '/api/',
        ],
      },
    ],
    sitemap: buildAbsoluteUrl('/sitemap.xml'),
  }
}
