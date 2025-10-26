import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Filter, Package, Edit, Trash2, Eye } from 'lucide-react'
import { DataTable } from '../../components/table/DataTable'
import { ProductForm } from '../../components/forms/ProductForm'
import { api } from '../../lib/api'

interface Product {
  id: string
  name: string
  sku: string
  description: string
  category: string
  price: number
  cost: number
  stock_quantity: number
  min_stock_level: number
  status: string
  created_at: string
  updated_at: string
}

interface ProductListResponse {
  success: boolean
  data: {
    products: Product[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export function ProductList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const queryClient = useQueryClient()

  // Fetch products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', currentPage, searchQuery, selectedCategory, selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      })
      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedStatus) params.append('status', selectedStatus)
      
      const response = await api.get(`/inventory/products?${params}`)
      return response.data as ProductListResponse
    },
  })

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const response = await api.get('/inventory/categories')
      return response.data.data as Array<{ category: string; count: number }>
    },
  })

  // Create product mutation
  const createProduct = useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      const response = await api.post('/inventory/products', productData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setShowForm(false)
    },
  })

  // Update product mutation
  const updateProduct = useMutation({
    mutationFn: async ({ id, ...productData }: Partial<Product> & { id: string }) => {
      const response = await api.put(`/inventory/products/${id}`, productData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setShowForm(false)
      setEditingProduct(null)
    },
  })

  // Delete product mutation
  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/inventory/products/${productId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDelete = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct.mutate(productId)
    }
  }

  const handleFormSubmit = (productData: any) => {
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, ...productData })
    } else {
      createProduct.mutate(productData)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Product Name',
      cell: ({ row }: any) => (
        <div className="flex items-center">
          <Package className="h-4 w-4 text-blue-600 mr-2" />
          <div>
            <div className="font-medium text-gray-900">{row.getValue('name')}</div>
            <div className="text-sm text-gray-500">SKU: {row.getValue('sku')}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }: any) => (
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
          {row.getValue('category')}
        </span>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }: any) => (
        <span className="font-medium text-green-600">
          ${row.getValue('price').toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'stock_quantity',
      header: 'Stock',
      cell: ({ row }: any) => {
        const stock = row.getValue('stock_quantity')
        const minStock = row.getValue('min_stock_level')
        const isLowStock = stock <= minStock
        
        return (
          <div className="flex items-center">
            <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
              {stock}
            </span>
            {isLowStock && (
              <span className="ml-2 text-xs text-red-600">Low Stock</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status')
        return (
          <span className={`px-2 py-1 text-xs rounded ${
            status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }: any) => (
        <span className="text-sm text-gray-500">
          {new Date(row.getValue('created_at')).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  const products = productsData?.data.products || []
  const pagination = productsData?.data.pagination

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Package className="h-6 w-6 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categoriesData?.map(category => (
              <option key={category.category} value={category.category}>
                {category.category} ({category.count})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('')
              setSelectedStatus('')
            }}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={products}
          columns={columns}
          isLoading={isLoading}
        />
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm font-medium text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <ProductForm
              initialData={editingProduct || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isLoading={createProduct.isPending || updateProduct.isPending}
            />
          </div>
        </div>
      )}
    </div>
  )
}
