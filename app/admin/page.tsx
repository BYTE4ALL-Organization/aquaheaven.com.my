'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiPackage, FiShoppingBag, FiUsers, FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
  lowStockProducts: number
  recentOrders: any[]
  topProducts: any[]
}

const CURRENCY_OPTIONS = [
  { value: 'RM', label: 'RM (Malaysian Ringgit)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'SGD', label: 'SGD' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currencySymbol, setCurrencySymbol] = useState('RM')
  const [currencySaving, setCurrencySaving] = useState(false)
  const [seedReviewsLoading, setSeedReviewsLoading] = useState(false)
  const [seedReviewsResult, setSeedReviewsResult] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
    fetch('/api/admin/settings')
      .then((res) => res.ok ? res.json() : {})
      .then((data) => {
        if (data?.settings?.currencySymbol) setCurrencySymbol(data.settings.currencySymbol)
      })
      .catch(() => {})
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      const data = await response.json()
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-xl mb-4">❌ Error</div>
        <p className="text-gray-600">{error}</p>
        <button 
          onClick={fetchDashboardStats}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  const statCards = [
    {
      name: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: FiPackage,
      color: 'bg-blue-500',
      href: '/admin/products'
    },
    {
      name: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: FiShoppingBag,
      color: 'bg-green-500',
      href: '/admin/orders'
    },
    {
      name: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      color: 'bg-purple-500',
      href: '/admin/users'
    },
    {
      name: 'Total Revenue',
      value: `${currencySymbol} ${stats?.totalRevenue || 0}`,
      icon: FiDollarSign,
      color: 'bg-yellow-500',
      href: '/admin/orders'
    }
  ]

  const saveCurrency = async () => {
    setCurrencySaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currencySymbol }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data?.settings?.currencySymbol) setCurrencySymbol(data.settings.currencySymbol)
      }
    } finally {
      setCurrencySaving(false)
    }
  }

  const seedTowelReviews = async () => {
    setSeedReviewsResult(null)
    setSeedReviewsLoading(true)
    try {
      const res = await fetch('/api/admin/seed-towel-reviews', { method: 'POST' })
      const data = await res.json()
      if (data?.success) {
        setSeedReviewsResult(`Added ${data.reviews} reviews across ${data.products} towel product(s).`)
        fetchDashboardStats()
      } else {
        setSeedReviewsResult(data?.error || 'Failed to seed reviews')
      }
    } catch (e) {
      setSeedReviewsResult(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setSeedReviewsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your admin dashboard</p>
      </div>

      {/* Global settings – visible at top */}
      <div className="bg-white shadow rounded-lg border-2 border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Global settings</h2>
        <p className="text-sm text-gray-500 mb-5">Site-wide currency and towel reviews. These apply across the store.</p>

        <div className="space-y-6">
          {/* Currency */}
          <div className="pb-5 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Site currency</h3>
            <p className="text-sm text-gray-500 mb-3">Used on all product prices, cart, and orders.</p>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={saveCurrency}
                disabled={currencySaving}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50"
              >
                {currencySaving ? 'Saving…' : 'Save currency'}
              </button>
            </div>
          </div>

          {/* Add reviews to all towels */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Towel reviews</h3>
            <p className="text-sm text-gray-500 mb-3">Add 25–115 positive reviews to every towel product. Reviews are from people who love using the towels: smooth, nice after shower, premium feel, good size, gentle on skin.</p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={seedTowelReviews}
                disabled={seedReviewsLoading}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50"
              >
                {seedReviewsLoading ? 'Adding reviews…' : 'Add reviews to all towels'}
              </button>
              {seedReviewsResult && (
                <span className={seedReviewsResult.startsWith('Added') ? 'text-green-600 text-sm font-medium' : 'text-red-600 text-sm'}>
                  {seedReviewsResult}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Low Stock Alert */}
      {stats && stats.lowStockProducts > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiTrendingDown className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Low Stock Alert
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  {stats.lowStockProducts} products are running low on stock. 
                  <Link href="/admin/products" className="font-medium underline ml-1">
                    View products
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Orders
            </h3>
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {stats.recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {currencySymbol} {order.total}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent orders</p>
            )}
            <div className="mt-4">
              <Link
                href="/admin/orders"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all orders →
              </Link>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Top Products
            </h3>
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                      {index + 1}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.reviewCount} reviews • {product.averageRating}★
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {currencySymbol} {product.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No products available</p>
            )}
            <div className="mt-4">
              <Link
                href="/admin/products"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all products →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
