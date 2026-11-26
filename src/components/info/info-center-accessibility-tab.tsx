import { AccessibilityControls } from '@/components/info/accessibility-controls'

export function InfoCenterAccessibilityTab() {
  return (
    <div className='flex flex-col gap-6'>
      <p className='text-muted-foreground'>
        Pengaturan tampilan berlaku di peramban ini, termasuk sebelum Anda masuk ke akun PanganTani.
      </p>
      <AccessibilityControls />
    </div>
  )
}
