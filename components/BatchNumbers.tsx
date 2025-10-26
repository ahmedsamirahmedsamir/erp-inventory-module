import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tag, Calendar } from 'lucide-react'
import { api, DataTable, LoadingSpinner, StatusBadge, EmptyState } from '@erp-modules/shared'

interface BatchNumber {
  id: string
  batch_number: string
  product_name: string
  sku: string
  quantity: number
  expiry_date: string
  manufacturing_date: string
  status: 'active' | 'expired' | 'recalled'
  location: string
}

export function BatchNumbers() {
  const { data: batches, isLoading } = useQuery({
    queryKey: ['batch-numbers'],
    queryFn: async () => {
      const response = await api.get<{ data: BatchNumber[] }>('/api/v1/inventory/batch-numbers')
      return response.data.data
    },
  })

  const columns = [
    {
      accessorKey: 'batch_number',
      header: 'Batch Number',
      cell: ({ row }: any) => (
        <div className="flex items-center">
          <Tag className="h-4 w-4 text-purple-600 mr-2" />
          <span className="font-mono font-medium">{row.getValue('batch_number')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'product_name',
      header: 'Product',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('product_name')}</div>
          <div className="text-sm text-gray-500">{row.original.sku}</div>
        </div>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }: any) => (
        <span className="font-medium">{row.getValue('quantity')}</span>
      ),
    },
    {
      accessorKey: 'expiry_date',
      header: 'Expiry Date',
      cell: ({ row }: any) => {
        const expiryDate = new Date(row.getValue('expiry_date'))
        const daysUntilExpiry = Math.floor((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return (
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <div>
              <div className="text-sm">{expiryDate.toLocaleDateString()}</div>
              {daysUntilExpiry < 30 && daysUntilExpiry > 0 && (
                <div className="text-xs text-yellow-600">{daysUntilExpiry} days left</div>
              )}
              {daysUntilExpiry <= 0 && (
                <div className="text-xs text-red-600">Expired</div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => <StatusBadge status={row.getValue('status')} />,
    },
  ]

  if (isLoading) {
    return <LoadingSpinner text="Loading batches..." />
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Batch Number Tracking</h2>
      {batches && batches.length > 0 ? (
        <DataTable data={batches} columns={columns} />
      ) : (
        <EmptyState
          icon={Tag}
          title="No batch numbers found"
          description="Batch numbers will appear here when products are tracked"
        />
      )}
    </div>
  )
}

