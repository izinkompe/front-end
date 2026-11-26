import { GlobalLayout as GlobalLayoutComponent } from '@/components/layout/global-layout'

export default function GlobalLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <GlobalLayoutComponent>{children}</GlobalLayoutComponent>
}
