import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Package, DollarSign, Archive, BarChart3, MapPin } from 'lucide-react'
import { api, LoadingSpinner, StatusBadge } from '@erp-modules/shared'

interface ProductDetail {
  id: string
  sku: string
  name: string
  description: string
  category: string
  price: number
  cost: number
  stock_quantity: number
  min_stock_level: number
  status: string
  supplier_name: string
  location_name: string
  images: string[]
}

export function ProductDetail({ productId }: { productId: string }) {
  const { data: product, isLoading } = useQuery({
    queryKey: ['product-detail', productId],
    queryFn: async () => {
      const response = await api.get<{ data: ProductDetail }>(`/api/v1/inventory/products/${productId}`)
      return response.data.data
    },
  })

  if (isLoading) {
    return <LoadingSpinner text="Loading product..." />
  }

  if (!product) return null

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            <p className="text-gray-600 mt-1">SKU: {product.sku}</p>
          </div>
          <StatusBadge status={product.status} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="mt-1 text-gray-900">{product.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <p className="mt-1 text-gray-900">{product.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Supplier</label>
                <p className="mt-1 text-gray-900">{product.supplier_name}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-xs text-blue-600">Price</p>
                  <p className="text-xl font-bold text-blue-900">${product.price}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <Archive className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-xs text-green-600">Stock</p>
                  <p className="text-xl font-bold text-green-900">{product.stock_quantity}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

