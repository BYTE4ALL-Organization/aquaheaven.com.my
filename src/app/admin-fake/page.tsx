'use client'

import Link from 'next/link'
import {
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiTrendingDown,
} from 'react-icons/fi'

// Fake data – no API calls
const FAKE_STATS = {
  totalProducts: 124,
  totalOrders: 892,
  totalUsers: 3420,
  totalRevenue: 186420,
  lowStockProducts: 7,
}

const FAKE_RECENT_ORDERS = [
  { id: '1', orderNumber: 'ORD-2841', total: 299.9, status: 'DELIVERED', createdAt: '2025-02-04T10:30:00Z' },
  { id: '2', orderNumber: 'ORD-2840', total: 159.5, status: 'SHIPPED', createdAt: '2025-02-04T09:15:00Z' },
  { id: '3', orderNumber: 'ORD-2839', total: 89.0, status: 'PENDING', createdAt: '2025-02-03T16:45:00Z' },
  { id: '4', orderNumber: 'ORD-2838', total: 425.0, status: 'DELIVERED', createdAt: '2025-02-03T14:20:00Z' },
  { id: '5', orderNumber: 'ORD-2837', total: 199.0, status: 'PROCESSING', createdAt: '2025-02-03T11:00:00Z' },
]

const FAKE_TOP_PRODUCTS = [
  { id: '1', name: 'Classic Cotton T-Shirt', price: 89, reviewCount: 124, averageRating: 4.8 },
  { id: '2', name: 'Slim Fit Chinos', price: 159, reviewCount: 89, averageRating: 4.6 },
  { id: '3', name: 'Leather Crossbody Bag', price: 249, reviewCount: 56, averageRating: 4.9 },
  { id: '4', name: 'Wool Blend Blazer', price: 399, reviewCount: 42, averageRating: 4.7 },
  { id: '5', name: 'Running Sneakers Pro', price: 299, reviewCount: 203, averageRating: 4.5 },
]

const statCards = [
  {
    name: 'Total Products',
    value: FAKE_STATS.totalProducts,
    icon: FiPackage,
    color: 'bg-blue-500',
    href: '/admin-fake/products',
  },
  {
    name: 'Total Orders',
    value: FAKE_STATS.totalOrders,
    icon: FiShoppingBag,
    color: 'bg-green-500',
    href: '/admin-fake/orders',
  },
  {
    name: 'Total Users',
    value: FAKE_STATS.totalUsers,
    icon: FiUsers,
    color: 'bg-purple-500',
    href: '/admin-fake/users',
  },
  {
    name: 'Total Revenue',
    value: `RM ${FAKE_STATS.totalRevenue.toLocaleString()}`,
    icon: FiDollarSign,
    color: 'bg-yellow-500',
    href: '/admin-fake/orders',
  },
]

export default function AdminFakeDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          This is a demo view with sample data. Use the real dashboard to manage your store.
        </p>
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
      {FAKE_STATS.lowStockProducts > 0 && (
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
                  {FAKE_STATS.lowStockProducts} products are running low on stock.
                  <span className="font-medium text-yellow-800 ml-1">(Demo)</span>
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
            <div className="space-y-3">
              {FAKE_RECENT_ORDERS.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
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
                      RM {order.total.toFixed(2)}
                    </p>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'DELIVERED'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href="/admin-fake/orders"
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
            <div className="space-y-3">
              {FAKE_TOP_PRODUCTS.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center py-2 border-b border-gray-100 last:border-b-0"
                >
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
                      RM {product.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href="/admin-fake/products"
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
