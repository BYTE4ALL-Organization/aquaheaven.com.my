'use client'

import { FiUsers, FiMail, FiCalendar } from 'react-icons/fi'

// Fake users data
const FAKE_USERS = [
  {
    id: 'usr_1234567890',
    email: 'john.doe@example.com',
    name: 'John Doe',
    image: null,
    createdAt: '2024-12-15T10:00:00Z',
    _count: { orders: 5, reviews: 3 },
  },
  {
    id: 'usr_2345678901',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    image: null,
    createdAt: '2024-12-20T14:30:00Z',
    _count: { orders: 12, reviews: 8 },
  },
  {
    id: 'usr_3456789012',
    email: 'bob.johnson@example.com',
    name: 'Bob Johnson',
    image: null,
    createdAt: '2025-01-05T09:15:00Z',
    _count: { orders: 2, reviews: 1 },
  },
  {
    id: 'usr_4567890123',
    email: 'alice.brown@example.com',
    name: 'Alice Brown',
    image: null,
    createdAt: '2025-01-10T11:45:00Z',
    _count: { orders: 8, reviews: 5 },
  },
  {
    id: 'usr_5678901234',
    email: 'charlie.wilson@example.com',
    name: 'Charlie Wilson',
    image: null,
    createdAt: '2025-01-15T16:20:00Z',
    _count: { orders: 3, reviews: 2 },
  },
  {
    id: 'usr_6789012345',
    email: 'diana.lee@example.com',
    name: 'Diana Lee',
    image: null,
    createdAt: '2025-01-20T13:00:00Z',
    _count: { orders: 15, reviews: 12 },
  },
  {
    id: 'usr_7890123456',
    email: 'emma.davis@example.com',
    name: 'Emma Davis',
    image: null,
    createdAt: '2025-01-25T10:30:00Z',
    _count: { orders: 1, reviews: 0 },
  },
  {
    id: 'usr_8901234567',
    email: 'frank.miller@example.com',
    name: 'Frank Miller',
    image: null,
    createdAt: '2025-02-01T08:15:00Z',
    _count: { orders: 6, reviews: 4 },
  },
]

export default function FakeUsersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="mt-2 text-gray-600">Demo view with sample user data</p>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reviews
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {FAKE_USERS.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.image ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover mr-4"
                          src={user.image}
                          alt={user.name || user.email}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                          <FiUsers className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <FiMail className="h-4 w-4 mr-2 text-gray-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user._count.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user._count.reviews}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <FiCalendar className="h-4 w-4 mr-2 text-gray-400" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
