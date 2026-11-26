'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Bookmark, Heart, Plus, Settings, X } from 'lucide-react'
import { BuyerAuthDialog } from '@/components/auth/buyer-auth-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { useBookmarkLists, useFavorites, useToggleFavoriteOffer } from '@/hooks/api/use-favorites'
import { useHydrated } from '@/hooks/use-hydrated'
import { CreateBookmarkListDialog } from './create-bookmark-list-dialog'
import { CustomListDetail, SidebarFarmerRow, SidebarOfferRow } from './favorites-sidebar-items'

interface FavoritesSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FavoritesSidebar({ open, onOpenChange }: FavoritesSidebarProps) {
  const isHydrated = useHydrated()
  const { data: user, isPending: userPending } = useCurrentUser()
  const { data: favoritesData, isLoading: favoritesLoading, isError, refetch } = useFavorites()
  const { data: listsData, isLoading: listsLoading } = useBookmarkLists()
  const toggleFavoriteOffer = useToggleFavoriteOffer()

  const [authOpen, setAuthOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedView, setSelectedView] = useState<'overview' | 'default' | string>('overview')

  const isBuyer = isHydrated && user?.role === 'buyer'
  const isWrongRole = Boolean(isHydrated && user && user.role !== 'buyer')
  const lists = listsData?.lists ?? []
  const activeCustomList =
    selectedView !== 'overview' && selectedView !== 'default'
      ? lists.find((item) => item.id === selectedView)
      : undefined

  function handleSheetOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSelectedView('overview')
    }
    onOpenChange(nextOpen)
  }

  function closeSidebar() {
    handleSheetOpenChange(false)
  }

  const headerTitle = !isBuyer
    ? 'Favorit'
    : selectedView === 'default'
      ? 'Favorit'
      : activeCustomList
        ? activeCustomList.name
        : 'Daftar Tersimpan'

  const defaultTotalCount =
    (favoritesData?.offers.length ?? 0) + (favoritesData?.farmers.length ?? 0)

  return (
    <>
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side='right'
          showCloseButton={false}
          className='flex h-full w-full flex-col gap-0 p-0 sm:max-w-md'
        >
          <SheetHeader className='grid h-14 shrink-0 grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 border-b border-border px-3 py-0'>
            <div className='flex items-center justify-start'>
              {isBuyer && selectedView !== 'overview' && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => setSelectedView('overview')}
                  aria-label='Kembali ke daftar tersimpan'
                >
                  <ArrowLeft className='size-4.5' aria-hidden='true' />
                </Button>
              )}
            </div>
            <SheetTitle className='truncate text-center text-base font-semibold'>
              {headerTitle}
            </SheetTitle>
            <div className='flex items-center justify-end'>
              <SheetClose
                render={<Button type='button' variant='ghost' size='icon' aria-label='Tutup' />}
              >
                <X className='size-4.5' aria-hidden='true' />
              </SheetClose>
            </div>
            <SheetDescription className='sr-only'>
              Panel samping untuk melihat komoditas favorit, petani diikuti, dan daftar bookmark.
            </SheetDescription>
          </SheetHeader>

          <div className='flex-1 overflow-y-auto overscroll-contain px-5 py-5'>
            {!isHydrated || userPending ? (
              <div className='flex flex-col gap-3'>
                <Skeleton className='h-20 w-full rounded-xl' />
                <Skeleton className='h-20 w-full rounded-xl' />
              </div>
            ) : !isBuyer ? (
              <div className='flex flex-col gap-2 py-2'>
                <h3 className='text-base font-semibold text-foreground'>
                  {isWrongRole ? 'Gunakan akun pembeli' : 'Belum ada yang disimpan!'}
                </h3>
                <p className='text-sm leading-relaxed text-muted-foreground'>
                  {isWrongRole
                    ? 'Daftar komoditas favorit dan bookmark hanya tersedia pada akun pembeli.'
                    : 'Saat Anda menyimpan komoditas atau petani favorit, item tersebut akan muncul di sini.'}
                </p>
              </div>
            ) : favoritesLoading || listsLoading ? (
              <div className='flex flex-col gap-3'>
                <Skeleton className='h-20 w-full rounded-xl' />
                <Skeleton className='h-20 w-full rounded-xl' />
              </div>
            ) : isError ? (
              <Alert variant='destructive'>
                <AlertDescription className='flex flex-wrap items-center justify-between gap-3'>
                  <span>Favorit gagal dimuat.</span>
                  <Button variant='outline' size='sm' onClick={() => refetch()}>
                    Muat ulang
                  </Button>
                </AlertDescription>
              </Alert>
            ) : selectedView === 'default' && favoritesData ? (
              <div className='flex flex-col gap-4'>
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-xs text-muted-foreground'>Daftar bawaan</span>
                  <Button
                    variant='outline'
                    size='sm'
                    nativeButton={false}
                    render={<Link href='/akun/pengaturan' onClick={closeSidebar} />}
                  >
                    <Settings data-icon='inline-start' aria-hidden='true' />
                    <span>Radius pengingat</span>
                  </Button>
                </div>

                <Tabs defaultValue='offers' className='gap-4'>
                  <TabsList
                    variant='line'
                    className='w-full justify-start border-b border-border p-0'
                  >
                    <TabsTrigger
                      value='offers'
                      className='flex-none gap-2 px-1 pb-2.5 after:bottom-0'
                    >
                      <span>Komoditas</span>
                      <Badge variant='secondary' className='h-5 px-1.5 text-xs tabular-nums'>
                        {favoritesData.offers.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value='farmers'
                      className='flex-none gap-2 px-1 pb-2.5 after:bottom-0'
                    >
                      <span>Petani diikuti</span>
                      <Badge variant='secondary' className='h-5 px-1.5 text-xs tabular-nums'>
                        {favoritesData.farmers.length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value='offers'>
                    {favoritesData.offers.length > 0 ? (
                      <ul className='flex flex-col gap-2.5'>
                        {favoritesData.offers.map((offer) => (
                          <SidebarOfferRow
                            key={offer.id}
                            offer={offer}
                            onNavigate={closeSidebar}
                            removing={
                              toggleFavoriteOffer.isPending &&
                              toggleFavoriteOffer.variables === offer.id
                            }
                            onRemove={() => toggleFavoriteOffer.mutate(offer.id)}
                            removeLabel={'Hapus ' + offer.commodityName + ' dari favorit'}
                          />
                        ))}
                      </ul>
                    ) : (
                      <div className='rounded-xl border border-dashed border-border px-4 py-6 text-center'>
                        <p className='text-sm font-medium text-foreground'>
                          Belum ada komoditas favorit
                        </p>
                        <p className='mt-1 text-xs text-muted-foreground'>
                          Klik ikon hati pada kartu komoditas di Pasar Panen untuk menyimpannya.
                        </p>
                        <Button
                          variant='outline'
                          size='sm'
                          className='mt-3'
                          nativeButton={false}
                          render={<Link href='/pasar' onClick={closeSidebar} />}
                        >
                          Jelajahi pasar panen
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value='farmers'>
                    {favoritesData.farmers.length > 0 ? (
                      <ul className='flex flex-col gap-2.5'>
                        {favoritesData.farmers.map((farmer) => (
                          <SidebarFarmerRow
                            key={farmer.id}
                            farmer={farmer}
                            onNavigate={closeSidebar}
                          />
                        ))}
                      </ul>
                    ) : (
                      <div className='rounded-xl border border-dashed border-border px-4 py-6 text-center'>
                        <p className='text-sm font-medium text-foreground'>
                          Belum mengikuti petani
                        </p>
                        <p className='mt-1 text-xs text-muted-foreground'>
                          Buka profil kebun petani dan tekan Ikuti untuk memantau panen terbaru.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            ) : activeCustomList ? (
              <CustomListDetail
                list={activeCustomList}
                favoriteOffers={favoritesData?.offers ?? []}
                onNavigate={closeSidebar}
                onDeleted={() => setSelectedView('overview')}
              />
            ) : (
              <div className='flex flex-col gap-3'>
                <button
                  type='button'
                  onClick={() => setSelectedView('default')}
                  className='flex w-full items-center gap-3.5 rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                >
                  <div className='flex size-16 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60'>
                    <Heart className='size-6 fill-rose-500 text-rose-500' aria-hidden='true' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-base font-semibold text-foreground'>Favorit</p>
                    <p className='text-sm text-muted-foreground tabular-nums'>
                      Daftar bawaan · {defaultTotalCount} item
                    </p>
                  </div>
                </button>

                {lists.length > 0 && <Separator className='my-1' />}

                {lists.map((list) => {
                  const coverImage = list.offers[0]?.photos[0]
                  return (
                    <button
                      key={list.id}
                      type='button'
                      onClick={() => setSelectedView(list.id)}
                      className='flex w-full items-center gap-3.5 rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    >
                      <div className='relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted'>
                        {coverImage ? (
                          <Image
                            src={coverImage}
                            alt={list.name}
                            fill
                            sizes='64px'
                            className='object-cover'
                          />
                        ) : (
                          <Bookmark className='size-5 text-muted-foreground' aria-hidden='true' />
                        )}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-base font-semibold text-foreground'>
                          {list.name}
                        </p>
                        <p className='truncate text-sm text-muted-foreground'>
                          {list.description || `${list.offers.length} item`}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {isHydrated && !userPending && (
            <div className='mt-auto border-t border-border bg-background px-5 py-4'>
              {!isBuyer ? (
                <div className='flex items-center justify-between gap-4'>
                  <p className='text-xs leading-relaxed text-muted-foreground'>
                    {isWrongRole
                      ? 'Masuk dengan akun pembeli untuk mengakses daftar tersimpan.'
                      : 'Masuk untuk mengakses simpanan Anda di berbagai perangkat dan membuat daftar bookmark.'}
                  </p>
                  <Button
                    type='button'
                    onClick={() => setAuthOpen(true)}
                    className='shrink-0 rounded-full px-5'
                  >
                    {isWrongRole ? 'Ganti akun' : 'Masuk'}
                  </Button>
                </div>
              ) : (
                <button
                  type='button'
                  onClick={() => setCreateDialogOpen(true)}
                  className='flex w-full items-center gap-3 rounded-lg text-left transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                >
                  <span className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground'>
                    <Plus className='size-5' aria-hidden='true' />
                  </span>
                  <span className='text-sm font-semibold text-foreground'>
                    Buat daftar bookmark baru
                  </span>
                </button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <BuyerAuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      <CreateBookmarkListDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={(created) => setSelectedView(created.id)}
      />
    </>
  )
}
