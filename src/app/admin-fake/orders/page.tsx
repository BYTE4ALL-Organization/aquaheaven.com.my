'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiEye, FiSearch, FiFilter } from 'react-icons/fi'

// Fake orders data
const FAKE_ORDERS = [
  {
    id: '1',
    orderNumber: 'ORD-2841',
    status: 'DELIVERED',
    total: 299.9,
    subtotal: 279.9,
    tax: 20.0,
    shipping: 0,
    paymentStatus: 'COMPLETED',
    createdAt: '2025-02-04T10:30:00Z',
    user: { name: 'John Doe', email: 'john@example.com' },
    items: [
      { id: '1', quantity: 2, price: 89, product: { name: 'Classic Cotton T-Shirt', thumbnail: '/images/pic1.png' } },
      { id: '2', quantity: 1, price: 159, product: { name: 'Slim Fit Chinos', thumbnail: '/images/pic2.png' } },
    ],
  },
  {
    id: '2',
    orderNumber: 'ORD-2840',
    status: 'SHIPPED',
    total: 159.5,
    subtotal: 149.5,
    tax: 10.0,
    shipping: 0,
    paymentStatus: 'COMPLETED',
    createdAt: '2025-02-04T09:15:00Z',
    user: { name: 'Jane Smith', email: 'jane@example.com' },
    items: [
      { id: '3', quantity: 1, price: 159, product: { name: 'Slim Fit Chinos', thumbnail: '/images/pic2.png' } },
    ],
  },
  {
    id: '3',
    orderNumber: 'ORD-2839',
    status: 'PENDING',
    total: 89.0,
    subtotal: 79.0,
    tax: 10.0,
    shipping: 0,
    paymentStatus: 'PENDING',
    createdAt: '2025-02-03T16:45:00Z',
    user: { name: 'Bob Johnson', email: 'bob@example.com' },
    items: [
      { id: '4', quantity: 1, price: 89, product: { name: 'Classic Cotton T-Shirt', thumbnail: '/images/pic1.png' } },
    ],
  },
  {
    id: '4',
    orderNumber: 'ORD-2838',
    status: 'DELIVERED',
    total: 425.0,
    subtotal: 399.0,
    tax: 26.0,
    shipping: 0,
    paymentStatus: 'COMPLETED',
    createdAt: '2025-02-03T14:20:00Z',
    user: { name: 'Alice Brown', email: 'alice@example.com' },
    items: [
      { id: '5', quantity: 1, price: 399, product: { name: 'Wool Blend Blazer', thumbnail: '/images/pic4.png' } },
    ],
  },
  {
    id: '5',
    orderNumber: 'ORD-2837',
    status: 'PROCESSING',
    total: 199.0,
    subtotal: 179.0,
    tax: 20.0,
    shipping: 0,
    paymentStatus: 'COMPLETED',
    createdAt: '2025-02-03T11:00:00Z',
    user: { name: 'Charlie Wilson', email: 'charlie@example.com' },
    items: [
      { id: '6', quantity: 1, price: 179, product: { name: 'Denim Jacket', thumbnail: '/images/pic7.png' } },
    ],
  },
  {
    id: '6',
    orderNumber: 'ORD-2836',
    status: 'CANCELLED',
    total: 249.0,
    subtotal: 229.0,
    tax: 20.0,
    shipping: 0,
    paymentStatus: 'REFUNDED',
    createdAt: '2025-02-02T15:30:00Z',
    user: { name: 'Diana Lee', email: 'diana@example.com' },
    items: [
      { id: '7', quantity: 1, price: 249, product: { name: 'Leather Crossbody Bag', thumbnail: '/images/pic3.png' } },
    ],
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800'
    case 'PROCESSING':
      return 'bg-purple-100 text-purple-800'
    case 'SHIPPED':
      return 'bg-indigo-100 text-indigo-800'
    case 'DELIVERED':
      return 'bg-green-100 text-green-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    case 'REFUNDED':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'COMPLETED':
      return 'bg-green-100 text-green-800'
    case 'FAILED':
      return 'bg-red-100 text-red-800'
    case 'REFUNDED':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function FakeOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredOrders = FAKE_ORDERS.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user?.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="mt-2 text-gray-600">Demo view with sample order data</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <FiEye className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'No orders match your filters.'
                : 'Orders will appear here when customers make purchases.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.user?.name || 'Guest'}
                        </div>
                        <div className="text-sm text-gray-500">{order.user?.email || '—'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={item.id} className="flex items-center">
                            {item.product.thumbnail && (
                              <img
                                className="h-8 w-8 rounded object-cover"
                                src={item.product.thumbnail}
                                alt={item.product.name}
                              />
                            )}
                            {index < 2 && index < order.items.length - 1 && (
                              <span className="mx-1 text-gray-400">+</span>
                            )}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-sm text-gray-500 ml-1">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      RM {order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <span className="text-gray-400 cursor-not-allowed" title="View (Demo)">
                        <FiEye className="h-4 w-4" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
