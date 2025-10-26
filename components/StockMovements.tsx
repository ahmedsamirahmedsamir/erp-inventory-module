import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { api, DataTable, LoadingSpinner, StatusBadge } from '@erp-modules/shared'

interface StockMovement {
  id: string
  product_name: string
  type: 'in' | 'out' | 'transfer' | 'adjustment'
  quantity: number
  from_location: string
  to_location: string
  reference: string
  user_name: string
  timestamp: string
}

export function StockMovements() {
  const { data: movements, isLoading } = useQuery({
    queryKey: ['stock-movements'],
    queryFn: async () => {
      const response = await api.get<{ data: StockMovement[] }>('/api/v1/inventory/stock/movements')
      return response.data.data
    },
  })

  const columns = [
    {
      accessorKey: 'timestamp',
      header: 'Date',
      cell: ({ row }: any) => (
        <span className="text-sm">{new Date(row.getValue('timestamp')).toLocaleString()}</span>
      ),
    },
    {
      accessorKey: 'product_name',
      header: 'Product',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }: any) => {
        const type = row.getValue('type')
        const icons: Record<string, any> = {
          in: <TrendingUp className="h-4 w-4 text-green-600" />,
          out: <TrendingDown className="h-4 w-4 text-red-600" />,
          transfer: <ArrowRight className="h-4 w-4 text-blue-600" />,
          adjustment: <RefreshCw className="h-4 w-4 text-purple-600" />,
        }
        return (
          <div className="flex items-center">
            {icons[type]}
            <span className="ml-2 text-sm">{type}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }: any) => {
        const qty = row.getValue('quantity')
        const type = row.original.type
        return (
          <span className={`font-medium ${
            type === 'in' ? 'text-green-600' : type === 'out' ? 'text-red-600' : 'text-gray-900'
          }`}>
            {type === 'in' ? '+' : type === 'out' ? '-' : ''}{qty}
          </span>
        )
      },
    },
    {
      accessorKey: 'from_location',
      header: 'From',
      cell: ({ row }: any) => (
        <span className="text-sm text-gray-600">{row.getValue('from_location') || '-'}</span>
      ),
    },
    {
      accessorKey: 'to_location',
      header: 'To',
      cell: ({ row }: any) => (
        <span className="text-sm text-gray-600">{row.getValue('to_location') || '-'}</span>
      ),
    },
    {
      accessorKey: 'user_name',
      header: 'User',
    },
  ]

  if (isLoading) {
    return <LoadingSpinner text="Loading movements..." />
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Stock Movements</h2>
      {movements && <DataTable data={movements} columns={columns} pageSize={20} />}
    </div>
  )
}

