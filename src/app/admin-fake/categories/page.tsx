'use client'

import { FiPlus, FiEdit, FiTrash2, FiTag } from 'react-icons/fi'

// Fake categories data
const FAKE_CATEGORIES = [
  {
    id: '1',
    name: "Men's Clothes",
    slug: 'mens-clothes',
    description: 'Stylish and comfortable clothing for men',
    image: null,
    createdAt: '2025-01-01T10:00:00Z',
    parentId: null,
    parent: null,
    children: [
      {
        id: '11',
        name: 'T-Shirts',
        slug: 't-shirts',
        description: null,
        image: null,
        _count: { products: 15 },
      },
      {
        id: '12',
        name: 'Jeans',
        slug: 'jeans',
        description: null,
        image: null,
        _count: { products: 8 },
      },
      {
        id: '13',
        name: 'Shirts',
        slug: 'shirts',
        description: null,
        image: null,
        _count: { products: 12 },
      },
    ],
    _count: { products: 35 },
  },
  {
    id: '2',
    name: "Women's Clothes",
    slug: 'womens-clothes',
    description: 'Fashion-forward clothing for women',
    image: null,
    createdAt: '2025-01-01T10:00:00Z',
    parentId: null,
    parent: null,
    children: [
      {
        id: '21',
        name: 'Dresses',
        slug: 'dresses',
        description: null,
        image: null,
        _count: { products: 20 },
      },
      {
        id: '22',
        name: 'Tops',
        slug: 'tops',
        description: null,
        image: null,
        _count: { products: 18 },
      },
    ],
    _count: { products: 38 },
  },
  {
    id: '3',
    name: "Kids' Clothes",
    slug: 'kids-clothes',
    description: 'Fun and colorful clothing for children',
    image: null,
    createdAt: '2025-01-01T10:00:00Z',
    parentId: null,
    parent: null,
    children: [],
    _count: { products: 25 },
  },
  {
    id: '4',
    name: 'Bags and Shoes',
    slug: 'bags-shoes',
    description: 'Accessories and footwear for all occasions',
    image: null,
    createdAt: '2025-01-01T10:00:00Z',
    parentId: null,
    parent: null,
    children: [
      {
        id: '41',
        name: 'Handbags',
        slug: 'handbags',
        description: null,
        image: null,
        _count: { products: 14 },
      },
      {
        id: '42',
        name: 'Sneakers',
        slug: 'sneakers',
        description: null,
        image: null,
        _count: { products: 10 },
      },
    ],
    _count: { products: 26 },
  },
]

export default function FakeCategoriesPage() {
  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="mt-2 text-gray-600">Demo view with sample category data</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-500 bg-gray-100 cursor-not-allowed">
            <FiPlus className="h-4 w-4 mr-2" />
            Add Category (Demo)
          </span>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-6">
        {FAKE_CATEGORIES.map((category) => (
          <div key={category.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {category.image ? (
                    <img
                      className="h-12 w-12 rounded-lg object-cover"
                      src={category.image}
                      alt={category.name}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                      <FiTag className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500">
                    {category._count.products} products
                    {category.children.length > 0 && ` • ${category.children.length} subcategories`}
                  </p>
                </div>
              </div>

              {category.description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
                </div>
              )}

              {/* Subcategories */}
              {category.children.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Subcategories</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.children.map((subcategory) => (
                      <div key={subcategory.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h5 className="text-sm font-medium text-gray-900">
                              {subcategory.name}
                            </h5>
                            <p className="text-xs text-gray-500 mt-1">
                              {subcategory._count.products} products
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            <span className="text-gray-400 cursor-not-allowed" title="Edit (Demo)">
                              <FiEdit className="h-4 w-4" />
                            </span>
                            <span
                              className="text-gray-400 cursor-not-allowed"
                              title="Delete (Demo)"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Created {new Date(category.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 cursor-not-allowed" title="Edit (Demo)">
                    <FiEdit className="h-4 w-4" />
                  </span>
                  <span className="text-gray-400 cursor-not-allowed" title="Delete (Demo)">
                    <FiTrash2 className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
