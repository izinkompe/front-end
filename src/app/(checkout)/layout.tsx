export default function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div className='flex min-h-screen flex-col bg-background text-foreground'>{children}</div>
}
