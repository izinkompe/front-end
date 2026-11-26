import { Suspense } from 'react'
import type { Metadata } from 'next'
import { FarmerOnboardingFlow } from '@/components/auth/farmer/farmer-onboarding-flow'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Daftar Jadi Petani',
  description:
    'Daftar sebagai mitra petani PanganTani untuk menyalurkan hasil panen langsung ke pembeli.',
})

async function FarmerRegisterContent({
  searchParams,
}: {
  searchParams: Promise<{ lanjut?: string }>
}) {
  const params = await searchParams
  return <FarmerOnboardingFlow resumeNotice={params.lanjut === '1'} />
}

export default function FarmerRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ lanjut?: string }>
}) {
  return (
    <Suspense fallback={<FarmerOnboardingFlow />}>
      <FarmerRegisterContent searchParams={searchParams} />
    </Suspense>
  )
}
