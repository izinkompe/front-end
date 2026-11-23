'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Sprout, ChevronsUpDown, Check, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getDashboardActor } from './dashboard-navigation-data'
import { cn } from '@/lib/utils'

export interface KebunItem {
  id: string
  name: string
  location: string
  area: string
  commodity: string
}

export const INITIAL_KEBUN_LIST: KebunItem[] = [
  {
    id: 'kbn-01',
    name: 'Kebun Organik Lembang',
    location: 'Lembang, Bandung Barat',
    area: '1.2 Ha',
    commodity: 'Sayuran Dataran Tinggi',
  },
  {
    id: 'kbn-02',
    name: 'Lahan Padi Ciwidey',
    location: 'Ciwidey, Bandung',
    area: '2.5 Ha',
    commodity: 'Padi Organik',
  },
  {
    id: 'kbn-03',
    name: 'Kebun Hortikultura Pangalengan',
    location: 'Pangalengan, Bandung',
    area: '0.8 Ha',
    commodity: 'Kentang & Kubis',
  },
]

export const kebunFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nama kebun minimal 2 karakter')
    .max(60, 'Nama kebun maksimal 60 karakter'),
  location: z
    .string()
    .trim()
    .min(2, 'Lokasi kebun minimal 2 karakter')
    .max(80, 'Lokasi maksimal 80 karakter'),
  area: z.string().trim().max(30, 'Luas lahan maksimal 30 karakter').default(''),
  commodity: z.string().trim().max(50, 'Komoditas maksimal 50 karakter').default(''),
})

export type KebunFormValues = z.infer<typeof kebunFormSchema>

interface KebunSwitcherProps {
  variant?: 'header' | 'sidebar'
  className?: string
}

function generateKebunId() {
  return `kbn-${Date.now()}`
}

export function validateKebunName({ value }: { value: string }) {
  const res = z.string().trim().min(2, 'Nama kebun minimal 2 karakter').safeParse(value)
  return res.success ? undefined : res.error.issues[0]?.message
}

export function validateKebunLocation({ value }: { value: string }) {
  const res = z.string().trim().min(2, 'Lokasi kebun minimal 2 karakter').safeParse(value)
  return res.success ? undefined : res.error.issues[0]?.message
}

export function KebunSwitcher({ variant = 'header', className }: KebunSwitcherProps) {
  const pathname = usePathname() ?? ''
  const actor = getDashboardActor(pathname)

  const [kebunList, setKebunList] = React.useState<KebunItem[]>(INITIAL_KEBUN_LIST)
  const [selectedId, setSelectedId] = React.useState<string>(INITIAL_KEBUN_LIST[0].id)
  const [isSelectOpen, setIsSelectOpen] = React.useState(false)
  const [isAddOpen, setIsAddOpen] = React.useState(false)

  const form = useForm({
    defaultValues: {
      name: '',
      location: '',
      area: '',
      commodity: '',
    },
    onSubmit: async ({ value }) => {
      const parsed = kebunFormSchema.safeParse(value)
      if (!parsed.success) return

      const newKebun: KebunItem = {
        id: generateKebunId(),
        name: parsed.data.name,
        location: parsed.data.location || 'Bandung',
        area: parsed.data.area || '1.0 Ha',
        commodity: parsed.data.commodity || 'Komoditas Campuran',
      }

      setKebunList((prev) => [newKebun, ...prev])
      setSelectedId(newKebun.id)
      form.reset()
      setIsAddOpen(false)
    },
  })

  if (actor !== 'farmer') {
    return null
  }

  const activeKebun = kebunList.find((item) => item.id === selectedId) || kebunList[0]

  const handleSelectKebun = (id: string) => {
    setSelectedId(id)
    setIsSelectOpen(false)
  }

  return (
    <>
      {variant === 'sidebar' ? (
        <div
          className={cn(
            'flex flex-col gap-2 rounded-none border border-sidebar-border bg-sidebar-accent/50 p-2.5',
            className
          )}
        >
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2 min-w-0'>
              <span className='flex size-6 shrink-0 items-center justify-center bg-primary text-primary-foreground'>
                <Sprout className='size-3.5' />
              </span>
              <div className='flex flex-col min-w-0'>
                <span className='truncate text-xs font-semibold text-sidebar-foreground'>
                  {activeKebun.name}
                </span>
                <span className='truncate text-[10px] text-muted-foreground'>
                  {activeKebun.location} • {activeKebun.area}
                </span>
              </div>
            </div>
            <Badge variant='outline'>{activeKebun.commodity.split(' ')[0]}</Badge>
          </div>

          <Button
            variant='outline'
            className='w-full justify-between gap-1.5'
            onClick={() => setIsSelectOpen(true)}
          >
            <span className='truncate text-xs'>Pilih / Tambah Kebun</span>
            <ChevronsUpDown className='size-3 text-muted-foreground shrink-0' />
          </Button>
        </div>
      ) : (
        <div className={cn('flex items-center gap-1.5 sm:gap-2', className)}>
          <Button
            variant='outline'
            className='flex items-center gap-2 max-w-[200px] sm:max-w-[280px]'
            onClick={() => setIsSelectOpen(true)}
            aria-label='Pilih kebun aktif'
          >
            <Sprout className='size-3.5 text-primary shrink-0' />
            <span className='truncate text-xs font-medium'>{activeKebun.name}</span>
            <ChevronsUpDown className='size-3 text-muted-foreground shrink-0 ml-auto' />
          </Button>
        </div>
      )}

      <Dialog open={isSelectOpen} onOpenChange={setIsSelectOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Pilih Kebun Aktif</DialogTitle>
            <DialogDescription>
              Pilih kebun atau lahan untuk memantau inventaris hasil panen dan transaksi komoditas.
            </DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-2 max-h-[300px] overflow-y-auto py-1'>
            {kebunList.map((kebun) => {
              const isSelected = kebun.id === activeKebun.id
              return (
                <button
                  key={kebun.id}
                  type='button'
                  onClick={() => handleSelectKebun(kebun.id)}
                  className={cn(
                    'flex items-center justify-between gap-3 border p-3 text-left transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border bg-card hover:bg-accent/50 text-foreground'
                  )}
                >
                  <div className='flex items-start gap-2.5 min-w-0'>
                    <div
                      className={cn(
                        'mt-0.5 flex size-6 shrink-0 items-center justify-center',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Sprout className='size-3.5' />
                    </div>
                    <div className='flex flex-col min-w-0'>
                      <span className='truncate text-xs font-semibold'>{kebun.name}</span>
                      <span className='truncate text-[10px] text-muted-foreground'>
                        {kebun.location} • {kebun.area}
                      </span>
                      <span className='truncate text-[10px] text-primary font-medium'>
                        {kebun.commodity}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className='size-4 text-primary shrink-0' />}
                </button>
              )
            })}
          </div>

          <DialogFooter className='flex-col sm:flex-row gap-2'>
            <Button
              className='w-full sm:w-auto gap-1.5'
              onClick={() => {
                setIsSelectOpen(false)
                setIsAddOpen(true)
              }}
            >
              <Plus className='size-4' />
              <span>Tambah Kebun Baru</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          if (!open) {
            form.reset()
          }
          setIsAddOpen(open)
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Tambah Kebun Baru</DialogTitle>
            <DialogDescription>
              Daftarkan lahan atau kebun pertanian baru Anda ke dalam sistem PanganTani.
            </DialogDescription>
          </DialogHeader>

          <form
            noValidate
            onSubmit={async (e) => {
              e.preventDefault()
              e.stopPropagation()
              await form.validateAllFields('submit')
              await form.handleSubmit()
            }}
            className='flex flex-col gap-3 py-1'
          >
            <form.Field
              name='name'
              validators={{
                onChange: validateKebunName,
              }}
            >
              {(field) => (
                <div className='flex flex-col gap-1.5'>
                  <Label htmlFor={field.name}>Nama Kebun / Lahan *</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    required
                    placeholder='Contoh: Kebun Sayur Parongpong'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <span className='text-[11px] text-destructive'>
                      {Array.from(new Set(field.state.meta.errors)).join(', ')}
                    </span>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name='location'
              validators={{
                onChange: validateKebunLocation,
              }}
            >
              {(field) => (
                <div className='flex flex-col gap-1.5'>
                  <Label htmlFor={field.name}>Lokasi *</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    required
                    placeholder='Contoh: Parongpong, Bandung Barat'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <span className='text-[11px] text-destructive'>
                      {Array.from(new Set(field.state.meta.errors)).join(', ')}
                    </span>
                  )}
                </div>
              )}
            </form.Field>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <form.Field name='area'>
                {(field) => (
                  <div className='flex flex-col gap-1.5'>
                    <Label htmlFor={field.name}>Luas Lahan</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder='Contoh: 1.5 Ha'
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name='commodity'>
                {(field) => (
                  <div className='flex flex-col gap-1.5'>
                    <Label htmlFor={field.name}>Komoditas Utama</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder='Contoh: Tomat & Cabai'
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <DialogFooter className='pt-2 gap-2 flex-col-reverse sm:flex-row'>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  form.reset()
                  setIsAddOpen(false)
                  setIsSelectOpen(true)
                }}
              >
                Kembali
              </Button>
              <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                  <Button type='submit' disabled={!canSubmit || isSubmitting}>
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Kebun'}
                  </Button>
                )}
              </form.Subscribe>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
