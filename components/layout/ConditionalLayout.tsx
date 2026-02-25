'use client'

import { useEffect } from 'react'
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

  // Scroll to top when navigating (e.g. clicking a nav tab) so the top of the page stays visible
  useEffect(() => {
    if (pathname) window.scrollTo(0, 0)
  }, [pathname])

  // All store pages (home, shop, account, cart, etc.) get banner, main navbar, and footer; only admin is excluded.
  return (
    <>
      {!isAdminRoute && <TopBanner />}
      {!isAdminRoute && <TopNavbar />}
      {children}
      {!isAdminRoute && <Footer />}
    </>
  )
}




