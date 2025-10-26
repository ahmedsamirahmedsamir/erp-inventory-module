import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Hash, Package } from 'lucide-react'
import { api, DataTable, LoadingSpinner, StatusBadge, EmptyState } from '@erp-modules/shared'

interface SerialNumber {
  id: string
  serial_number: string
  product_name: string
  sku: string
  status: 'available' | 'sold' | 'defective' | 'returned'
  location: string
  created_at: string
  sold_at: string | null
}

export function SerialNumbers() {
  const { data: serialNumbers, isLoading } = useQuery({
    queryKey: ['serial-numbers'],
    queryFn: async () => {
      const response = await api.get<{ data: SerialNumber[] }>('/api/v1/inventory/serial-numbers')
      return response.data.data
    },
  })

  const columns = [
    {
      accessorKey: 'serial_number',
      header: 'Serial Number',
      cell: ({ row }: any) => (
        <div className="flex items-center">
          <Hash className="h-4 w-4 text-blue-600 mr-2" />
          <span className="font-mono font-medium">{row.getValue('serial_number')}</span>
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
      accessorKey: 'location',
      header: 'Location',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => <StatusBadge status={row.getValue('status')} />,
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }: any) => (
        <span className="text-sm">{new Date(row.getValue('created_at')).toLocaleDateString()}</span>
      ),
    },
  ]

  if (isLoading) {
    return <LoadingSpinner text="Loading serial numbers..." />
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Serial Number Tracking</h2>
      {serialNumbers && serialNumbers.length > 0 ? (
        <DataTable data={serialNumbers} columns={columns} />
      ) : (
        <EmptyState
          icon={Hash}
          title="No serial numbers found"
          description="Serial numbers will appear here when products are tracked"
        />
      )}
    </div>
  )
}

