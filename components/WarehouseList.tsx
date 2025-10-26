import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Warehouse, MapPin } from 'lucide-react'
import { 
  api, DataTable, LoadingSpinner, StatusBadge, 
  ActionButtons, EmptyState 
} from '@erp-modules/shared'

interface Warehouse {
  id: string
  name: string
  code: string
  address: string
  city: string
  country: string
  total_capacity: number
  used_capacity: number
  status: 'active' | 'inactive'
}

export function WarehouseList() {
  const { data: warehouses, isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const response = await api.get<{ data: Warehouse[] }>('/api/v1/inventory/warehouses')
      return response.data.data
    },
  })

  const columns = [
    {
      accessorKey: 'name',
      header: 'Warehouse',
      cell: ({ row }: any) => (
        <div className="flex items-center">
          <Warehouse className="h-4 w-4 text-purple-600 mr-2" />
          <div>
            <div className="font-medium">{row.getValue('name')}</div>
            <div className="text-sm text-gray-500">{row.original.code}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Location',
      cell: ({ row }: any) => (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{row.original.city}, {row.original.country}</span>
        </div>
      ),
    },
    {
      accessorKey: 'used_capacity',
      header: 'Capacity',
      cell: ({ row }: any) => {
        const used = row.getValue('used_capacity')
        const total = row.original.total_capacity
        const percentage = (used / total) * 100
        return (
          <div className="space-y-1">
            <div className="text-sm text-gray-600">{used}/{total} units</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${
                  percentage > 90 ? 'bg-red-600' : percentage > 70 ? 'bg-yellow-600' : 'bg-green-600'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
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
    return <LoadingSpinner text="Loading warehouses..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Warehouses</h2>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Warehouse
        </button>
      </div>

      {warehouses && warehouses.length > 0 ? (
        <DataTable data={warehouses} columns={columns} />
      ) : (
        <EmptyState
          icon={Warehouse}
          title="No warehouses found"
          description="Add warehouses to manage inventory locations"
        />
      )}
    </div>
  )
}

