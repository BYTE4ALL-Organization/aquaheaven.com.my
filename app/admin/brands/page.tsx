'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiPlus, FiEdit, FiTrash2, FiAward } from 'react-icons/fi'

interface Brand {
  id: string
  name: string
  slug: string
  logo: string | null
  createdAt: string
  _count?: {
    products: number
  }
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/brands')
      if (!response.ok) {
        throw new Error('Failed to fetch brands')
      }
      const data = await response.json()
      setBrands(data.brands || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (brandId: string) => {
    try {
      const response = await fetch(`/api/admin/brands/${brandId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete brand')
      }
      
      setBrands(brands.filter(b => b.id !== brandId))
      setShowDeleteModal(false)
      setBrandToDelete(null)
    } catch (err) {
      console.error('Error deleting brand:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete brand')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
          <p className="mt-2 text-gray-600">Manage product brands</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/brands/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <FiPlus className="h-4 w-4 mr-2" />
            Add Brand
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Brands Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <FiAward className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No brands</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new brand.
            </p>
            <div className="mt-6">
              <Link
                href="/admin/brands/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <FiPlus className="h-4 w-4 mr-2" />
                Add Brand
              </Link>
            </div>
          </div>
        ) : (
          brands.map((brand) => (
            <div key={brand.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {brand.logo ? (
                      <img 
                        className="h-12 w-12 rounded-lg object-cover" 
                        src={brand.logo} 
                        alt={brand.name}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <FiAward className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {brand.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {brand._count?.products || 0} products
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Created {new Date(brand.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/brands/${brand.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit Brand"
                    >
                      <FiEdit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        setBrandToDelete(brand.id)
                        setShowDeleteModal(true)
                      }}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Brand"
                      disabled={brand._count && brand._count.products > 0}
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {brand._count && brand._count.products > 0 && (
                  <div className="mt-2 text-xs text-yellow-600">
                    Cannot delete brand with products.
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <FiTrash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Brand</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this brand? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => handleDelete(brandToDelete!)}
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setBrandToDelete(null)
                  }}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
