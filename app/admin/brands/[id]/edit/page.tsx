'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import ImagePicker from '@/components/admin/ImagePicker'

interface Brand {
  id: string
  name: string
  slug: string
  logo: string | null
}

export default function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id } = await params
        const brandRes = await fetch(`/api/admin/brands/${id}`)
        if (!brandRes.ok) throw new Error('Failed to fetch brand')
        const brandData = await brandRes.json()
        setBrand(brandData.brand)

        // Populate form
        if (brandData.brand) {
          setFormData({
            name: brandData.brand.name || '',
            slug: brandData.brand.slug || '',
            logo: brandData.brand.logo || ''
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData(prev => ({
        ...prev,
        slug
      }))
    }
  }

  const handleImageChange = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, logo: imageUrl }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    if (!formData.name || !formData.slug) {
      setError('Name and slug are required')
      setSaving(false)
      return
    }

    try {
      const { id } = await params
      const response = await fetch(`/api/admin/brands/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          logo: formData.logo || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update brand')
      }

      router.push('/admin/brands')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update brand')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error && !brand) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-xl mb-4">❌ Error</div>
        <p className="text-gray-600">{error}</p>
        <Link
          href="/admin/brands"
          className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Brands
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/admin/brands"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Back to Brands
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Edit Brand</h1>
            <p className="mt-2 text-gray-600">Update brand information</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Brand Information</h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Brand Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Nike"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  id="slug"
                  required
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., nike"
                />
                <p className="mt-1 text-sm text-gray-500">
                  URL-friendly identifier (auto-generated from name)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Logo
                </label>
                <ImagePicker
                  label="Brand Logo"
                  value={formData.logo}
                  onChange={handleImageChange}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Optional logo image for the brand
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Link
            href="/admin/brands"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
