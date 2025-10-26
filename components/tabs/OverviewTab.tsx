import React from 'react'
import { Package, AlertTriangle } from 'lucide-react'

interface OverviewTabProps {
  analytics?: {
    total_products: number
    low_stock_items: number
    total_stock_value: number
    warehouses_count: number
  }
}

export function OverviewTab({ analytics }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Inventory Overview
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total Products</div>
            <div className="text-2xl font-bold text-blue-600">{analytics?.total_products || 0}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Stock Value</div>
            <div className="text-2xl font-bold text-green-600">${analytics?.total_stock_value?.toLocaleString() || 0}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
          Stock Alerts
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-red-50 rounded">
            <span className="text-sm text-gray-600">Low Stock Items</span>
            <span className="text-lg font-semibold text-red-600">{analytics?.low_stock_items || 0}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Warehouses</span>
            <span className="text-lg font-semibold">{analytics?.warehouses_count || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

