import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export function InfoPageShell({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <article className='mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href='/' />}>Beranda</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className='flex flex-col gap-1.5'>
        <h1 className='text-2xl font-bold sm:text-3xl'>{title}</h1>
        {description && <p className='text-sm text-muted-foreground'>{description}</p>}
      </header>

      <div className='flex flex-col gap-6 text-base leading-relaxed'>{children}</div>
    </article>
  )
}

export function InfoSection({
  id,
  title,
  children,
}: {
  id?: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className='flex flex-col gap-2 border-t border-border pt-5'>
      <h2 className='text-lg font-semibold text-foreground'>{title}</h2>
      {children}
    </section>
  )
}
