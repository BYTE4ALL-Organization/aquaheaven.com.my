'use client'

import { usePathname } from 'next/navigation'
import TopBanner from './Banner/TopBanner'
import TopNavbar from './Navbar/TopNavbar'
import Footer from './Footer'

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin') ?? false

  return (
    <>
      {!isAdminRoute && <TopBanner />}
      {!isAdminRoute && <TopNavbar />}
      {children}
      {!isAdminRoute && <Footer />}
    </>
  )
}




