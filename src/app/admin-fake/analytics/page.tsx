'use client'

import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingBag, FiUsers, FiPackage } from 'react-icons/fi'

// Fake analytics data
const FAKE_ANALYTICS = {
  revenue: {
    today: 12450,
    yesterday: 11200,
    thisWeek: 89200,
    lastWeek: 78500,
    thisMonth: 342000,
    lastMonth: 298000,
  },
  orders: {
    today: 45,
    yesterday: 38,
    thisWeek: 312,
    lastWeek: 289,
    thisMonth: 1245,
    lastMonth: 1098,
  },
  users: {
    today: 23,
    yesterday: 18,
    thisWeek: 156,
    lastWeek: 142,
    thisMonth: 678,
    lastMonth: 612,
  },
  products: {
    total: 124,
    active: 118,
    inactive: 6,
    lowStock: 7,
  },
  topCategories: [
    { name: "Men's Clothes", orders: 245, revenue: 45600 },
    { name: "Women's Clothes", orders: 198, revenue: 38900 },
    { name: 'Bags and Shoes', orders: 156, revenue: 52300 },
    { name: "Kids' Clothes", orders: 89, revenue: 12400 },
  ],
}

const calculateChange = (current: number, previous: number) => {
  if (previous === 0) return { value: 100, isPositive: true }
  const change = ((current - previous) / previous) * 100
  return { value: Math.abs(change).toFixed(1), isPositive: change >= 0 }
}

export default function FakeAnalyticsPage() {
  const revenueChange = calculateChange(FAKE_ANALYTICS.revenue.thisMonth, FAKE_ANALYTICS.revenue.lastMonth)
  const ordersChange = calculateChange(FAKE_ANALYTICS.orders.thisMonth, FAKE_ANALYTICS.orders.lastMonth)
  const usersChange = calculateChange(FAKE_ANALYTICS.users.thisMonth, FAKE_ANALYTICS.users.lastMonth)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">Demo view with sample analytics data</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Revenue */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-green-500">
                  <FiDollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      RM {FAKE_ANALYTICS.revenue.thisMonth.toLocaleString()}
                    </div>
                    <div
                      className={`ml-2 flex items-baseline text-sm font-semibold ${
                        revenueChange.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {revenueChange.isPositive ? (
                        <FiTrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <FiTrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {revenueChange.value}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-blue-500">
                  <FiShoppingBag className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Orders</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {FAKE_ANALYTICS.orders.thisMonth}
                    </div>
                    <div
                      className={`ml-2 flex items-baseline text-sm font-semibold ${
                        ordersChange.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {ordersChange.isPositive ? (
                        <FiTrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <FiTrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {ordersChange.value}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-purple-500">
                  <FiUsers className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">New Users (Month)</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {FAKE_ANALYTICS.users.thisMonth}
                    </div>
                    <div
                      className={`ml-2 flex items-baseline text-sm font-semibold ${
                        usersChange.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {usersChange.isPositive ? (
                        <FiTrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <FiTrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {usersChange.value}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-yellow-500">
                  <FiPackage className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {FAKE_ANALYTICS.products.total}
                  </dd>
                  <dd className="text-sm text-gray-500 mt-1">
                    {FAKE_ANALYTICS.products.active} active • {FAKE_ANALYTICS.products.lowStock} low stock
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-4">
            {FAKE_ANALYTICS.topCategories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{category.name}</p>
                    <p className="text-sm text-gray-500">{category.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">RM {category.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
