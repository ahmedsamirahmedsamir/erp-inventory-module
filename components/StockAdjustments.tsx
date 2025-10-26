import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, RefreshCw } from 'lucide-react'
import { api, DataTable, LoadingSpinner, StatusBadge, EmptyState } from '@erp-modules/shared'

interface StockAdjustment {
  id: string
  product_name: string
  adjustment_type: 'increase' | 'decrease'
  quantity: number
  reason: string
  reference: string
  approved_by: string
  created_at: string
  status: 'pending' | 'approved' | 'rejected'
}

export function StockAdjustments() {
  const { data: adjustments, isLoading } = useQuery({
    queryKey: ['stock-adjustments'],
    queryFn: async () => {
      const response = await api.get<{ data: StockAdjustment[] }>('/api/v1/inventory/stock/adjust')
      return response.data.data
    },
  })

  const columns = [
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }: any) => (
        <span className="text-sm">{new Date(row.getValue('created_at')).toLocaleDateString()}</span>
      ),
    },
    {
      accessorKey: 'product_name',
      header: 'Product',
    },
    {
      accessorKey: 'adjustment_type',
      header: 'Type',
      cell: ({ row }: any) => {
        const type = row.getValue('adjustment_type')
        return (
          <span className={`px-2 py-1 text-xs rounded ${
            type === 'increase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {type}
          </span>
        )
      },
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }: any) => (
        <span className="font-medium">{row.getValue('quantity')}</span>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => <StatusBadge status={row.getValue('status')} />,
    },
  ]

  if (isLoading) {
    return <LoadingSpinner text="Loading adjustments..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Stock Adjustments</h2>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Adjustment
        </button>
      </div>

      {adjustments && adjustments.length > 0 ? (
        <DataTable data={adjustments} columns={columns} />
      ) : (
        <EmptyState
          icon={RefreshCw}
          title="No adjustments found"
          description="Stock adjustments will appear here"
        />
      )}
    </div>
  )
}

