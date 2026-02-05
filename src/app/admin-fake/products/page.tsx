'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch, FiPackage } from 'react-icons/fi'

// Fake products data
const FAKE_PRODUCTS = [
  {
    id: '1',
    name: 'Classic Cotton T-Shirt',
    slug: 'classic-cotton-tshirt',
    price: 89,
    quantity: 45,
    description: 'Comfortable cotton t-shirt in classic fit',
    thumbnail: '/images/pic1.png',
    isActive: true,
    isFeatured: true,
    category: { id: '1', name: 'Men\'s Clothes' },
    brand: { id: '1', name: 'Zara' },
    reviews: [{ id: '1', rating: 5 }, { id: '2', rating: 4 }, { id: '3', rating: 5 }],
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Slim Fit Chinos',
    slug: 'slim-fit-chinos',
    price: 159,
    quantity: 23,
    description: 'Modern slim-fit chinos in navy blue',
    thumbnail: '/images/pic2.png',
    isActive: true,
    isFeatured: false,
    category: { id: '1', name: 'Men\'s Clothes' },
    brand: { id: '2', name: 'Calvin Klein' },
    reviews: [{ id: '4', rating: 4 }, { id: '5', rating: 5 }],
    createdAt: '2025-01-20T14:30:00Z',
  },
  {
    id: '3',
    name: 'Leather Crossbody Bag',
    slug: 'leather-crossbody-bag',
    price: 249,
    quantity: 8,
    description: 'Premium leather crossbody bag',
    thumbnail: '/images/pic3.png',
    isActive: true,
    isFeatured: true,
    category: { id: '4', name: 'Bags and Shoes' },
    brand: { id: '3', name: 'Gucci' },
    reviews: [{ id: '6', rating: 5 }, { id: '7', rating: 5 }, { id: '8', rating: 4 }],
    createdAt: '2025-01-10T09:15:00Z',
  },
  {
    id: '4',
    name: 'Wool Blend Blazer',
    slug: 'wool-blend-blazer',
    price: 399,
    quantity: 12,
    description: 'Elegant wool blend blazer for formal occasions',
    thumbnail: '/images/pic4.png',
    isActive: true,
    isFeatured: false,
    category: { id: '1', name: 'Men\'s Clothes' },
    brand: { id: '4', name: 'Prada' },
    reviews: [{ id: '9', rating: 5 }],
    createdAt: '2025-01-25T11:45:00Z',
  },
  {
    id: '5',
    name: 'Running Sneakers Pro',
    slug: 'running-sneakers-pro',
    price: 299,
    quantity: 67,
    description: 'High-performance running sneakers',
    thumbnail: '/images/pic5.png',
    isActive: true,
    isFeatured: true,
    category: { id: '4', name: 'Bags and Shoes' },
    brand: { id: '5', name: 'Versace' },
    reviews: [{ id: '10', rating: 4 }, { id: '11', rating: 5 }, { id: '12', rating: 4 }],
    createdAt: '2025-01-05T08:20:00Z',
  },
  {
    id: '6',
    name: 'Summer Floral Dress',
    slug: 'summer-floral-dress',
    price: 129,
    quantity: 3,
    description: 'Beautiful floral print summer dress',
    thumbnail: '/images/pic6.png',
    isActive: true,
    isFeatured: false,
    category: { id: '2', name: 'Women\'s Clothes' },
    brand: { id: '1', name: 'Zara' },
    reviews: [{ id: '13', rating: 5 }, { id: '14', rating: 4 }],
    createdAt: '2025-02-01T16:00:00Z',
  },
  {
    id: '7',
    name: 'Denim Jacket',
    slug: 'denim-jacket',
    price: 179,
    quantity: 0,
    description: 'Classic denim jacket',
    thumbnail: '/images/pic7.png',
    isActive: false,
    isFeatured: false,
    category: { id: '1', name: 'Men\'s Clothes' },
    brand: { id: '2', name: 'Calvin Klein' },
    reviews: [],
    createdAt: '2024-12-20T10:30:00Z',
  },
]

export default function FakeProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProducts = FAKE_PRODUCTS.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  )

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-2 text-gray-600">Demo view with sample product data</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-500 bg-gray-100 cursor-not-allowed">
            <FiPlus className="h-4 w-4 mr-2" />
            Add Product (Demo)
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
            <p className="mt-1 text-sm text-gray-500">No products match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviews
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const avgRating =
                    product.reviews.length > 0
                      ? (
                          product.reviews.reduce((sum, review) => sum + review.rating, 0) /
                          product.reviews.length
                        ).toFixed(1)
                      : 'No reviews'
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.thumbnail && (
                            <img
                              className="h-12 w-12 rounded-lg object-cover mr-4"
                              src={product.thumbnail}
                              alt={product.name}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        RM {product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.quantity > 10
                              ? 'bg-green-100 text-green-800'
                              : product.quantity > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {product.isFeatured && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="ml-1">{avgRating}</span>
                          <span className="ml-1 text-gray-500">({product.reviews.length})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/shop/product/${product.slug}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Product"
                          >
                            <FiEye className="h-4 w-4" />
                          </Link>
                          <span className="text-gray-400 cursor-not-allowed" title="Edit (Demo)">
                            <FiEdit className="h-4 w-4" />
                          </span>
                          <span className="text-gray-400 cursor-not-allowed" title="Delete (Demo)">
                            <FiTrash2 className="h-4 w-4" />
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
