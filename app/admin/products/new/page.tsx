'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiSave, FiX, FiPlus } from 'react-icons/fi'
import ImagePicker from '@/components/admin/ImagePicker'
import { ALL_COLORS, ALL_SIZES } from '@/lib/constants/attributes'

interface Category {
  id: string
  name: string
}

interface Brand {
  id: string
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [publicImages, setPublicImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    quantity: 0,
    images: [] as string[],
    thumbnail: '',
    categoryIds: [] as string[],
    brandId: '',
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    sku: '',
    color: '',
    size: '',
    material: '',
    availableColors: [] as string[],
    availableSizes: [] as string[],
    volumeMl: '' as string | number,
    weightKg: '' as string | number,
    dimensions: ''
  })

  const fetchBrands = async () => {
    try {
      const brandsRes = await fetch('/api/admin/brands')
      if (!brandsRes.ok) throw new Error('Failed to fetch brands')
      const brandsData = await brandsRes.json()
      setBrands(brandsData.brands || [])
    } catch (err) {
      console.error('Error fetching brands:', err)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, brandsRes, imagesRes] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/admin/brands'),
          fetch('/api/admin/images')
        ])

        if (!categoriesRes.ok) throw new Error('Failed to fetch categories')
        if (!brandsRes.ok) throw new Error('Failed to fetch brands')

        const [categoriesData, brandsData, imagesData] = await Promise.all([
          categoriesRes.json(),
          brandsRes.json(),
          imagesRes.ok ? imagesRes.json() : Promise.resolve({ images: [] })
        ])

        const raw = categoriesData.categories || []
        setCategories(
          raw.map((c: { id: string; name: string; parent?: { name: string } }) => ({
            id: c.id,
            name: c.parent ? `${c.parent.name} › ${c.name}` : c.name
          }))
        )
        setBrands(brandsData.brands || [])
        if (Array.isArray(imagesData?.images)) setPublicImages(imagesData.images)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Refresh brands when window regains focus (in case user created a brand in another tab)
    const handleFocus = () => {
      fetchBrands()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const slugFromName = (n: string) =>
    n
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                type === 'number' ? parseFloat(value) || 0 : value
      }
      if (name === 'name') {
        next.slug = slugFromName(value) || prev.slug
      }
      return next
    })
  }

  const handleImagesChange = (imagesString: string) => {
    const images = imagesString ? imagesString.split(', ').filter(img => img) : []
    setFormData(prev => ({ ...prev, images }))
  }

  const toggleColor = (colorName: string) => {
    setFormData(prev => ({
      ...prev,
      availableColors: prev.availableColors.includes(colorName)
        ? prev.availableColors.filter(c => c !== colorName)
        : [...prev.availableColors, colorName]
    }))
  }

  const toggleSize = (sizeName: string) => {
    setFormData(prev => ({
      ...prev,
      availableSizes: prev.availableSizes.includes(sizeName)
        ? prev.availableSizes.filter(s => s !== sizeName)
        : [...prev.availableSizes, sizeName]
    }))
  }

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Client-side validation
      if (!formData.name || formData.name.trim() === '') {
        setError('Product name is required')
        setSaving(false)
        return
      }

      if (!asDraft && (formData.price === null || formData.price === undefined || formData.price < 0)) {
        setError('Valid price is required to create an active product. Use "Save as Draft" if price is not set.')
        setSaving(false)
        return
      }

      const submitData = {
        ...formData,
        categoryIds: formData.categoryIds || [],
        brandId: formData.brandId || null,
        isActive: asDraft ? false : formData.isActive,
        price: formData.price ?? 0,
        volumeMl: formData.volumeMl === '' || formData.volumeMl == null ? null : Number(formData.volumeMl),
        weightKg: formData.weightKg === '' || formData.weightKg == null ? null : Number(formData.weightKg),
        dimensions: formData.dimensions?.trim() || null
      }

      if (submitData.categoryIds.length === 0 && !asDraft) {
        submitData.isActive = false
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product')
      }

      router.push('/admin/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
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

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/admin/products"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
            <p className="mt-2 text-gray-600">Create a new product</p>
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
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Basic Information</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  Slug (auto-generated from name, editable)
                </label>
                <input
                  type="text"
                  name="slug"
                  id="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="e.g. my-product-name"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  required
                  min="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories {formData.isActive ? '* (at least one)' : '(optional for drafts)'}
                </label>
                <div className="mt-1 border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto bg-gray-50">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center gap-2 py-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.categoryIds.includes(category.id)}
                        onChange={() => {
                          setFormData((prev) => ({
                            ...prev,
                            categoryIds: prev.categoryIds.includes(category.id)
                              ? prev.categoryIds.filter((id) => id !== category.id)
                              : [...prev.categoryIds, category.id]
                          }))
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
                {formData.categoryIds.length === 0 && (
                  <p className="mt-1 text-sm text-amber-600">
                    No category selected. Product will be saved as draft.
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="brandId" className="block text-sm font-medium text-gray-700">
                    Brand
                  </label>
                  <Link
                    href="/admin/brands/new"
                    target="_blank"
                    className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center"
                  >
                    <FiPlus className="h-3 w-3 mr-1" />
                    Create Brand
                  </Link>
                </div>
                <select
                  name="brandId"
                  id="brandId"
                  value={formData.brandId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Product Details</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  id="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colours (select which this product has)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_COLORS.map((c) => (
                    <label key={c.name} className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.availableColors.includes(c.name)}
                        onChange={() => toggleColor(c.name)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sizes (select which this product has)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map((sizeName) => (
                    <label key={sizeName} className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.availableSizes.includes(sizeName)}
                        onChange={() => toggleSize(sizeName)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{sizeName}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="material" className="block text-sm font-medium text-gray-700">
                  Material
                </label>
                <input
                  type="text"
                  name="material"
                  id="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="volumeMl" className="block text-sm font-medium text-gray-700">
                  Volume (mL)
                </label>
                <input
                  type="number"
                  name="volumeMl"
                  id="volumeMl"
                  min={0}
                  step={1}
                  placeholder="e.g. 250"
                  value={formData.volumeMl === '' ? '' : formData.volumeMl}
                  onChange={(e) => {
                    const v = e.target.value
                    setFormData(prev => ({ ...prev, volumeMl: v === '' ? '' : (parseInt(v, 10) || 0) }))
                  }}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Optional. Integer only, no decimals.</p>
              </div>

              <div>
                <label htmlFor="weightKg" className="block text-sm font-medium text-gray-700">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weightKg"
                  id="weightKg"
                  min={0.1}
                  max={5}
                  step={0.1}
                  placeholder="e.g. 1.5"
                  value={formData.weightKg === '' ? '' : formData.weightKg}
                  onChange={(e) => {
                    const v = e.target.value
                    setFormData(prev => ({ ...prev, weightKg: v === '' ? '' : parseFloat(v) || 0 }))
                  }}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Optional. 0.1 to 5 kg.</p>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700">
                  Dimensions / Size
                </label>
                <input
                  type="text"
                  name="dimensions"
                  id="dimensions"
                  placeholder="e.g. 50 x 70 cm or Width 80cm, Height 120cm"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Optional. Free text for dimensions (e.g. towels).</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Media & Status</h3>
            
            <div className="space-y-6">
              <ImagePicker
                value={formData.thumbnail || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, thumbnail: value }))}
                label="Thumbnail Image"
                availableImages={publicImages}
              />

              <ImagePicker
                value={formData.images.join(', ')}
                onChange={handleImagesChange}
                label="Product Images"
                multiple={true}
                availableImages={publicImages}
              />

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                    Featured
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isBestSeller"
                    id="isBestSeller"
                    checked={formData.isBestSeller}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isBestSeller" className="ml-2 block text-sm text-gray-900">
                    Best Seller
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiX className="h-4 w-4 mr-2" />
            Cancel
          </Link>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <FiSave className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <FiSave className="h-4 w-4 mr-2" />
            {saving ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
