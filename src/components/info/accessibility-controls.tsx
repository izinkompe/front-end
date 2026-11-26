'use client'

import { useId } from 'react'
import { useAccessibility, type TextScale } from '@/components/providers/accessibility-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const scaleLabels: Record<TextScale, string> = {
  default: 'Standar',
  large: 'Besar',
  xlarge: 'Sangat besar',
}
const scales: TextScale[] = ['default', 'large', 'xlarge']

export function AccessibilityControls() {
  const id = useId()
  const { preferences, update } = useAccessibility()

  return (
    <Card>
      <CardHeader>
        <CardTitle id={id}>Tampilan bacaan</CardTitle>
        <CardDescription>
          Sesuaikan kontras warna dan ukuran teks sesuai kenyamanan membaca Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field orientation='horizontal' className='justify-between gap-4'>
            <FieldContent>
              <FieldLabel htmlFor={id + '-contrast'}>Kontras tinggi</FieldLabel>
              <FieldDescription>Perjelas teks, batas isian, dan penanda fokus.</FieldDescription>
            </FieldContent>
            <Switch
              id={id + '-contrast'}
              checked={preferences.highContrast}
              onCheckedChange={(highContrast) => update({ highContrast })}
            />
          </Field>
          <FieldSet>
            <FieldLegend id={id + '-scale'}>Ukuran teks</FieldLegend>
            <ToggleGroup
              aria-labelledby={id + '-scale'}
              value={[preferences.textScale]}
              spacing={2}
              variant='outline'
              onValueChange={(values) => {
                const textScale = scales.find((scale) => scale === values[0])
                if (textScale) update({ textScale })
              }}
              className='flex flex-wrap'
            >
              {scales.map((scale) => (
                <ToggleGroupItem key={scale} value={scale} className='min-h-11'>
                  {scaleLabels[scale]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </FieldSet>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
