'use client'

import { useState, useEffect } from 'react'
import { FiImage, FiX, FiCheck, FiFolder } from 'react-icons/fi'

const LOCAL_ROOT_FOLDER = '/products'

const FALLBACK_IMAGES = [
  '/products/pic1.png', '/products/pic2.png', '/products/clothing/dress-style-1.png', '/products/towels/pic4.png',
]

function normalizePath(p: string): string {
  if (!p || typeof p !== 'string') return ''
  try {
    if (p.startsWith('http://') || p.startsWith('https://')) {
      p = new URL(p).pathname
    }
  } catch {}
  const forward = p.replace(/\\/g, '/').trim()
  return forward.startsWith('/') ? forward : '/' + forward
}

function getAllFolders(images: string[]): string[] {
  const set = new Set<string>()
  images.forEach(imgPath => {
    const parts = imgPath.split('/').filter(Boolean)
    let current = ''
    for (let i = 0; i < parts.length - 1; i++) {
      current += '/' + parts[i]
      set.add(current)
    }
  })
  return Array.from(set).sort()
}

interface ImagePickerProps {
  value: string
  onChange: (value: string) => void
  label: string
  multiple?: boolean
  availableImages?: string[]
}

export default function ImagePickerLocal({ value, onChange, label, multiple = false, availableImages: availableImagesProp }: ImagePickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [fetchedImages, setFetchedImages] = useState<string[]>([])
  const [loadingImages, setLoadingImages] = useState(false)

  const rawImages = availableImagesProp?.length ? availableImagesProp : fetchedImages.length ? fetchedImages : FALLBACK_IMAGES
  const availableImages = rawImages
    .map(normalizePath)
    .filter(p => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(p))
    .filter(p => p.startsWith(LOCAL_ROOT_FOLDER + '/') || p === LOCAL_ROOT_FOLDER)

  const allFolders = getAllFolders(availableImages)

  useEffect(() => {
    if (!showPicker || availableImagesProp?.length) return
    let cancelled = false
    setLoadingImages(true)
    setSelectedFolder('')
    fetch('/api/admin/images')
      .then((res) => res.ok ? res.json() : { images: [] })
      .then((data: { images?: string[] }) => {
        if (!cancelled && Array.isArray(data.images) && data.images.length) setFetchedImages(data.images)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingImages(false) })
    return () => { cancelled = true }
  }, [showPicker, availableImagesProp?.length])

  const filteredLocalImages = availableImages.filter(imgPath => {
    const inFolder = !selectedFolder || imgPath.startsWith(selectedFolder + '/')
    const matchesSearch = !searchTerm.trim() || imgPath.toLowerCase().includes(searchTerm.toLowerCase())
    return inFolder && matchesSearch
  })

  const handleImageSelect = (imagePath: string) => {
    if (multiple) {
      const currentImages = value ? value.split(', ') : []
      if (!currentImages.includes(imagePath)) onChange([...currentImages, imagePath].join(', '))
      return
    }
    onChange(imagePath)
    setShowPicker(false)
  }

  const handleRemoveImage = (imagePath: string) => {
    if (multiple) {
      const currentImages = value ? value.split(', ') : []
      onChange(currentImages.filter(img => img !== imagePath).join(', '))
      return
    }
    onChange('')
  }

  const currentImages = multiple && value ? value.split(', ').filter(img => img) : (value ? [value] : [])

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      {currentImages.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {currentImages.map((image, index) => (
              <div key={index} className="relative group">
                <img src={image} alt={`Selected ${index + 1}`} className="h-16 w-16 object-cover rounded border" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowPicker(true)}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <FiImage className="h-4 w-4 mr-2" />
        {multiple ? 'Add Images' : 'Select Image'}
      </button>

      {showPicker && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{multiple ? 'Select Images' : 'Select Image'}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {loadingImages ? 'Loading…' : `${availableImages.length} images under ${LOCAL_ROOT_FOLDER}`}
                  </p>
                </div>
                <button type="button" onClick={() => setShowPicker(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Browse folders (under /public{LOCAL_ROOT_FOLDER})
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setSelectedFolder('')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedFolder === '' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                  >
                    <FiFolder className="h-4 w-4" />
                    All ({availableImages.length})
                  </button>
                  {allFolders.map((folder) => {
                    const count = availableImages.filter(p => p.startsWith(folder + '/')).length
                    return (
                      <button
                        key={folder}
                        type="button"
                        onClick={() => setSelectedFolder(folder)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedFolder === folder ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                      >
                        <FiFolder className="h-4 w-4" />
                        {folder} ({count})
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by name or path…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto border-2 border-dashed border-gray-300 p-4 min-h-[200px]">
                {filteredLocalImages.length > 0 ? (
                  filteredLocalImages.map((imagePath, index) => {
                    const src = normalizePath(imagePath)
                    return (
                      <div
                        key={`${src}-${index}`}
                        role="button"
                        tabIndex={0}
                        className="relative group cursor-pointer rounded border-2 border-gray-300 hover:border-blue-500 hover:ring-2 hover:ring-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                        onClick={() => handleImageSelect(imagePath)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleImageSelect(imagePath) } }}
                      >
                        <img src={src} alt={src} className="w-full h-20 object-cover rounded-t border-0" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center pointer-events-none">
                          <FiCheck className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-xs text-gray-600 mt-1 truncate px-1 pb-1 bg-white" title={src}>{src}</div>
                      </div>
                    )
                  })
                ) : (
                  <div className="col-span-full text-center text-gray-500">No images to display</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
