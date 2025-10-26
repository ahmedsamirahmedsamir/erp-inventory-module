import React from 'react'
import { Package, TrendingDown, AlertTriangle, Warehouse, BarChart3, Boxes, Truck } from 'lucide-react'
import { ModuleDashboard, useModuleQuery } from '@erp-modules/shared'
import { OverviewTab } from './tabs/OverviewTab'
import { ProductsTab } from './tabs/ProductsTab'
import { StockTab } from './tabs/StockTab'
import { WarehousesTab } from './tabs/WarehousesTab'
import { TransfersTab } from './tabs/TransfersTab'
import { ReportsTab } from './tabs/ReportsTab'

interface InventoryAnalytics {
  total_products: number
  low_stock_items: number
  total_stock_value: number
  warehouses_count: number
}

export default function InventoryDashboard() {
  const { data: analytics } = useModuleQuery<{ data: InventoryAnalytics }>(
    ['inventory-analytics'],
    '/api/v1/inventory/analytics'
  )

  const analyticsData = analytics?.data

  return (
    <ModuleDashboard
      title="Inventory Management"
      icon={Package}
      description="Product inventory and warehouse management system"
      kpis={[
        {
          id: 'products',
          label: 'Total Products',
          value: analyticsData?.total_products || 0,
          icon: Package,
          color: 'blue',
        },
        {
          id: 'low-stock',
          label: 'Low Stock Items',
          value: analyticsData?.low_stock_items || 0,
          icon: AlertTriangle,
          color: 'red',
        },
        {
          id: 'stock-value',
          label: 'Total Stock Value',
          value: `$${analyticsData?.total_stock_value?.toLocaleString() || 0}`,
          icon: TrendingDown,
          color: 'green',
        },
        {
          id: 'warehouses',
          label: 'Warehouses',
          value: analyticsData?.warehouses_count || 0,
          icon: Warehouse,
          color: 'purple',
        },
      ]}
      actions={[
        {
          id: 'create-product',
          label: 'Add Product',
          icon: Package,
          onClick: () => {},
          variant: 'primary',
        },
      ]}
      tabs={[
        {
          id: 'overview',
          label: 'Overview',
          icon: BarChart3,
          content: <OverviewTab analytics={analyticsData} />,
        },
        {
          id: 'products',
          label: 'Products',
          icon: Package,
          content: <ProductsTab />,
        },
        {
          id: 'stock',
          label: 'Stock Levels',
          icon: Boxes,
          content: <StockTab />,
        },
        {
          id: 'warehouses',
          label: 'Warehouses',
          icon: Warehouse,
          content: <WarehousesTab />,
        },
        {
          id: 'transfers',
          label: 'Transfers',
          icon: Truck,
          content: <TransfersTab />,
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: BarChart3,
          content: <ReportsTab />,
        },
      ]}
      defaultTab="overview"
    />
  )
}
