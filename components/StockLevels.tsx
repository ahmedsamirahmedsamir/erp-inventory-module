import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Package, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react'
import { api, DataTable, LoadingSpinner, FilterBar } from '@erp-modules/shared'

interface StockLevel {
  product_id: string
  product_name: string
  sku: string
  warehouse_name: string
  quantity: number
  min_level: number
  max_level: number
  status: 'ok' | 'low' | 'critical' | 'overstock'
  value: number
}

export function StockLevels() {
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: stockLevels, isLoading } = useQuery({
    queryKey: ['stock-levels', warehouseFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (warehouseFilter) params.append('warehouse', warehouseFilter)
      if (statusFilter) params.append('status', statusFilter)
      const response = await api.get<{ data: StockLevel[] }>(
        `/api/v1/inventory/stock?${params.toString()}`
      )
      return response.data.data
    },
  })

  const columns = [
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
      accessorKey: 'warehouse_name',
      header: 'Warehouse',
    },
    {
      accessorKey: 'quantity',
      header: 'Stock',
      cell: ({ row }: any) => {
        const qty = row.getValue('quantity')
        const min = row.original.min_level
        const status = row.original.status
        return (
          <div className="flex items-center">
            {status === 'critical' && <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />}
            {status === 'low' && <TrendingDown className="h-4 w-4 text-yellow-600 mr-2" />}
            <span className={`font-medium ${
              status === 'critical' ? 'text-red-600' :
              status === 'low' ? 'text-yellow-600' :
              'text-gray-900'
            }`}>
              {qty}
            </span>
            <span className="text-sm text-gray-500 ml-1">/ {min} min</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'value',
      header: 'Value',
      cell: ({ row }: any) => (
        <span className="font-medium">${row.getValue('value').toLocaleString()}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status')
        const colors: Record<string, string> = {
          ok: 'bg-green-100 text-green-800',
          low: 'bg-yellow-100 text-yellow-800',
          critical: 'bg-red-100 text-red-800',
          overstock: 'bg-blue-100 text-blue-800',
        }
        return (
          <span className={`px-2 py-1 text-xs rounded ${colors[status] || colors.ok}`}>
            {status}
          </span>
        )
      },
    },
  ]

  if (isLoading) {
    return <LoadingSpinner text="Loading stock levels..." />
  }

  const criticalCount = stockLevels?.filter(s => s.status === 'critical').length || 0
  const lowCount = stockLevels?.filter(s => s.status === 'low').length || 0

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Stock Levels</h2>

      {/* Alerts */}
      {(criticalCount > 0 || lowCount > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <p className="font-medium text-yellow-900">Stock Alerts</p>
              <p className="text-sm text-yellow-700">
                {criticalCount} critical, {lowCount} low stock items
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <FilterBar onClear={() => { setWarehouseFilter(''); setStatusFilter('') }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Statuses</option>
          <option value="critical">Critical</option>
          <option value="low">Low</option>
          <option value="ok">OK</option>
          <option value="overstock">Overstock</option>
        </select>
      </FilterBar>

      {stockLevels && <DataTable data={stockLevels} columns={columns} />}
    </div>
  )
}

