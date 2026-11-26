import Image from 'next/image'
import Link from 'next/link'
import { ArrowUp, Mail, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { InfoCenterAccessibilityTab } from './info-center-accessibility-tab'
import { InfoCenterContactTab } from './info-center-contact-tab'
import { INFO_CENTER_TABS, type InfoCenterTab, getInfoCenterTabConfig } from './info-center-data'
import { InfoCenterHelpTab } from './info-center-help-tab'
import { InfoCenterPrivacyTab } from './info-center-privacy-tab'
import { InfoCenterTermsTab } from './info-center-terms-tab'
import { TERMS_EFFECTIVE_DATE } from './terms-of-use-data'

interface InfoCenterViewProps {
  activeTab: InfoCenterTab
}

export function InfoCenterView({ activeTab }: InfoCenterViewProps) {
  const currentTab = getInfoCenterTabConfig(activeTab)

  return (
    <div id='atas' className='flex flex-col bg-background'>
      <header className='relative h-52 w-full overflow-hidden bg-muted sm:h-64 md:h-72'>
        <Image
          src='/images/hero.webp'
          alt=''
          fill
          loading='eager'
          fetchPriority='high'
          sizes='100vw'
          className='object-cover object-center'
        />
        <div
          aria-hidden='true'
          className='absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/35'
        />
        <div className='relative z-10 mx-auto flex h-full w-full max-w-5xl items-center px-4 sm:px-6'>
          <p className='font-heading text-3xl font-bold text-white sm:text-4xl md:text-5xl'>
            Pusat Informasi
          </p>
        </div>
      </header>

      <div className='mx-auto w-full max-w-5xl px-4 sm:px-6'>
        <nav
          aria-label='Pusat informasi PanganTani'
          className='relative z-20 -mt-7 rounded-xl border border-border bg-card px-2 py-2 shadow-sm sm:-mt-8 sm:px-4'
        >
          <ul className='flex flex-wrap items-center justify-center gap-1 sm:justify-around sm:gap-2'>
            {INFO_CENTER_TABS.map((item) => {
              const isActive = item.id === activeTab
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 sm:text-base',
                      isActive
                        ? 'bg-primary/10 font-semibold text-primary'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      <article className='mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href='/' />}>Beranda</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href='/pusat-informasi' />}>
                  Pusat Informasi
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentTab.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Badge variant='secondary' className='gap-1.5 px-3 py-1 text-xs font-medium'>
            <ShieldCheck className='size-3.5 text-primary' aria-hidden='true' />
            Indonesia (ID)
          </Badge>
        </div>

        <div className='flex flex-col gap-2 border-b border-border pb-6'>
          <h1 className='font-heading text-2xl font-bold text-foreground sm:text-3xl md:text-4xl'>
            {currentTab.title}
          </h1>
          <p className='text-sm font-medium text-muted-foreground sm:text-base'>
            Berlaku sejak: {TERMS_EFFECTIVE_DATE}
          </p>
          {currentTab.subtitle && (
            <p className='text-base font-semibold text-foreground sm:text-lg'>
              {currentTab.subtitle}
            </p>
          )}
          <p className='text-sm text-muted-foreground sm:text-base'>{currentTab.description}</p>
        </div>

        {activeTab === 'bantuan' && <InfoCenterHelpTab />}
        {activeTab === 'syarat' && <InfoCenterTermsTab />}
        {activeTab === 'kebijakan-privasi' && <InfoCenterPrivacyTab />}
        {activeTab === 'aksesibilitas' && <InfoCenterAccessibilityTab />}
        {activeTab === 'kontak' && <InfoCenterContactTab />}

        <div className='flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-col gap-1 text-sm text-muted-foreground'>
            <p className='font-medium text-foreground'>
              &copy; 2026 PanganTani Indonesia. Seluruh hak cipta dilindungi.
            </p>
            <p>Berlaku sejak {TERMS_EFFECTIVE_DATE}</p>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              nativeButton={false}
              render={
                activeTab === 'kontak' ? (
                  <a href='mailto:bantuan@pangantani.id' />
                ) : (
                  <Link href='/pusat-informasi?tab=kontak' />
                )
              }
            >
              <Mail data-icon='inline-start' aria-hidden='true' />
              Hubungi Kami
            </Button>
            <Button variant='outline' size='sm' nativeButton={false} render={<a href='#atas' />}>
              <ArrowUp data-icon='inline-start' aria-hidden='true' />
              Kembali ke Atas
            </Button>
          </div>
        </div>
      </article>
    </div>
  )
}
