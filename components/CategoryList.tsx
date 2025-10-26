import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Folder } from 'lucide-react'
import { 
  api, DataTable, LoadingSpinner, ActionButtons, EmptyState 
} from '@erp-modules/shared'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  description: string
  product_count: number
  parent_category: string
  created_at: string
}

export function CategoryList() {
  const queryClient = useQueryClient()

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<{ data: Category[] }>('/api/v1/inventory/categories')
      return response.data.data
    },
  })

  const columns = [
    {
      accessorKey: 'name',
      header: 'Category',
      cell: ({ row }: any) => (
        <div className="flex items-center">
          <Folder className="h-4 w-4 text-yellow-600 mr-2" />
          <span className="font-medium">{row.getValue('name')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'product_count',
      header: 'Products',
      cell: ({ row }: any) => (
        <span className="text-sm text-gray-600">{row.getValue('product_count')}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <ActionButtons
          onView={() => console.log('View', row.original)}
          onEdit={() => console.log('Edit', row.original)}
          onDelete={() => console.log('Delete', row.original)}
        />
      ),
    },
  ]

  if (isLoading) {
    return <LoadingSpinner text="Loading categories..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Product Categories</h2>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Category
        </button>
      </div>

      {categories && categories.length > 0 ? (
        <DataTable data={categories} columns={columns} />
      ) : (
        <EmptyState
          icon={Folder}
          title="No categories found"
          description="Create categories to organize products"
        />
      )}
    </div>
  )
}

