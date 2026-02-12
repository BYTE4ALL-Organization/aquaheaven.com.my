'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiSave, FiX, FiPlus } from 'react-icons/fi'
import ImagePicker from '@/components/admin/ImagePicker'
import { ALL_COLORS, ALL_SIZES } from '@/lib/constants/attributes'

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  quantity: number
  images: string[]
  thumbnail: string | null
  isActive: boolean
  isFeatured: boolean
  sku: string | null
  color: string | null
  size: string | null
  material: string | null
  availableColors?: string[]
  availableSizes?: string[]
  categories: {
    id: string
    name: string
  }[]
  brand: {
    id: string
    name: string
  } | null
}

interface Category {
  id: string
  name: string
}

interface Brand {
  id: string
  name: string
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [publicImages, setPublicImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', authorName: '' })
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewMessage, setReviewMessage] = useState<string | null>(null)
  const [seedReviewsLoading, setSeedReviewsLoading] = useState(false)
  const [seedReviewsMessage, setSeedReviewsMessage] = useState<string | null>(null)

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
    sku: '',
    color: '',
    size: '',
    material: '',
    availableColors: [] as string[],
    availableSizes: [] as string[]
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
        const { id } = await params
        const [productRes, categoriesRes, brandsRes, imagesRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`),
          fetch('/api/admin/categories'),
          fetch('/api/admin/brands'),
          fetch('/api/admin/images')
        ])

        if (!productRes.ok) throw new Error('Failed to fetch product')
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories')
        if (!brandsRes.ok) throw new Error('Failed to fetch brands')

        const [productData, categoriesData, brandsData, imagesData] = await Promise.all([
          productRes.json(),
          categoriesRes.json(),
          brandsRes.json(),
          imagesRes.ok ? imagesRes.json() : Promise.resolve({ images: [] })
        ])

        if (Array.isArray(imagesData?.images)) setPublicImages(imagesData.images)

        setProduct(productData.product)
        const rawCats = categoriesData.categories || []
        setCategories(
          rawCats.map((c: { id: string; name: string; parent?: { name: string } }) => ({
            id: c.id,
            name: c.parent ? `${c.parent.name} › ${c.name}` : c.name
          }))
        )
        setBrands(brandsData.brands || [])

        if (productData.product) {
          const prod = productData.product
          const catIds = (prod.categories ?? []).map((c: { id: string }) => c.id)
          setFormData({
            name: prod.name || '',
            slug: prod.slug || '',
            description: prod.description || '',
            price: prod.price || 0,
            quantity: prod.quantity || 0,
            images: prod.images || [],
            thumbnail: prod.thumbnail || '',
            categoryIds: catIds,
            brandId: prod.brand?.id || '',
            isActive: prod.isActive ?? true,
            isFeatured: prod.isFeatured ?? false,
            sku: prod.sku || '',
            color: prod.color || '',
            size: prod.size || '',
            material: prod.material || '',
            availableColors: prod.availableColors ?? [],
            availableSizes: prod.availableSizes ?? []
          })
        }
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
  }, [params])

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
        setError('Valid price is required to update an active product. Use "Save as Draft" if price is not set.')
        setSaving(false)
        return
      }

      const { id } = await params
      const submitData = {
        ...formData,
        categoryIds: formData.categoryIds || [],
        brandId: formData.brandId || null,
        isActive: asDraft ? false : formData.isActive,
        price: formData.price ?? 0,
      }

      if (submitData.categoryIds.length === 0 && !asDraft) {
        submitData.isActive = false
      }

      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update product')
      }

      router.push('/admin/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product?.id) return
    setReviewMessage(null)
    setReviewSubmitting(true)
    try {
      const res = await fetch(`/api/admin/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          authorName: reviewForm.authorName || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setReviewMessage('Review added.')
        setReviewForm({ rating: 5, comment: '', authorName: '' })
      } else {
        setReviewMessage(data.error || 'Failed to add review')
      }
    } catch (err) {
      setReviewMessage(err instanceof Error ? err.message : 'Failed to add review')
    } finally {
      setReviewSubmitting(false)
    }
  }

  const handleAddSampleReviews = async () => {
    if (!product?.id) return
    setSeedReviewsMessage(null)
    setSeedReviewsLoading(true)
    try {
      const res = await fetch('/api/admin/seed-towel-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
      const data = await res.json()
      if (data.success) {
        setSeedReviewsMessage(data.message || `Added ${data.reviews} reviews.`)
      } else {
        setSeedReviewsMessage(data.error || 'Failed to add reviews')
      }
    } catch (err) {
      setSeedReviewsMessage(err instanceof Error ? err.message : 'Failed to add reviews')
    } finally {
      setSeedReviewsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error && !product) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-xl mb-4">❌ Error</div>
        <p className="text-gray-600">{error}</p>
        <Link
          href="/admin/products"
          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <FiArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
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
              href="/admin/products"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            <p className="mt-2 text-gray-600">Update product information</p>
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
                        checked={(formData.availableColors ?? []).includes(c.name)}
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
                        checked={(formData.availableSizes ?? []).includes(sizeName)}
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
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Reviews: add one manually or add sample reviews for this product */}
      {product && (
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Reviews</h3>
          <p className="text-sm text-gray-500 mb-4">Add one review manually or add 25–115 sample positive reviews for this product.</p>

          <div className="space-y-6">
            <form onSubmit={handleAddReview} className="flex flex-col sm:flex-row flex-wrap gap-4 items-end border-b border-gray-100 pb-6">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>{r} stars</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Author name (optional)</label>
                <input
                  type="text"
                  value={reviewForm.authorName}
                  onChange={(e) => setReviewForm((f) => ({ ...f, authorName: e.target.value }))}
                  placeholder="e.g. John"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-[2] min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment *</label>
                <input
                  type="text"
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  placeholder="e.g. Very smooth, nice after shower."
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50"
              >
                {reviewSubmitting ? 'Adding…' : 'Add review'}
              </button>
            </form>
            {reviewMessage && (
              <p className={reviewMessage.startsWith('Review added') ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
                {reviewMessage}
              </p>
            )}

            <div>
              <button
                type="button"
                onClick={handleAddSampleReviews}
                disabled={seedReviewsLoading}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {seedReviewsLoading ? 'Adding reviews…' : 'Add 25–115 sample reviews to this product'}
              </button>
              {seedReviewsMessage && (
                <p className={`mt-2 text-sm ${seedReviewsMessage.includes('Added') ? 'text-green-600' : 'text-red-600'}`}>
                  {seedReviewsMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
