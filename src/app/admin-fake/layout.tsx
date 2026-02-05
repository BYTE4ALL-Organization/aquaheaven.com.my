'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FiHome,
  FiPackage,
  FiTag,
  FiShoppingBag,
  FiUsers,
  FiBarChart,
  FiArrowLeft,
} from 'react-icons/fi'

const navigation = [
  { name: 'Dashboard', href: '/admin-fake', icon: FiHome },
  { name: 'Products', href: '/admin-fake/products', icon: FiPackage },
  { name: 'Categories', href: '/admin-fake/categories', icon: FiTag },
  { name: 'Orders', href: '/admin-fake/orders', icon: FiShoppingBag },
  { name: 'Users', href: '/admin-fake/users', icon: FiUsers },
  { name: 'Analytics', href: '/admin-fake/analytics', icon: FiBarChart },
]

export default function AdminFakeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-x-2 sm:gap-x-4 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900 truncate mr-2 sm:mr-4">
              Dashboard
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
              Demo
            </span>
          </div>
          <nav className="flex items-center gap-x-1 sm:gap-x-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-x-3 sm:gap-x-4 lg:gap-x-6 flex-shrink-0">
          <Link
            href="/shop"
            className="flex items-center gap-x-1.5 sm:gap-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 whitespace-nowrap border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <FiArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>BACK</span>
          </Link>
          <Link
            href="/admin"
            className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-500 whitespace-nowrap hidden sm:inline"
          >
            Real Dashboard
          </Link>
          <Link
            href="/"
            className="text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 whitespace-nowrap hidden sm:inline"
          >
            View Site
          </Link>
        </div>
      </div>

      <div className="pt-16">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
