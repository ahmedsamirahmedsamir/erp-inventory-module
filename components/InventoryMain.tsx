import React from 'react'
import { 
  BarChart3, Package, Folder, Warehouse, 
  Archive, ArrowRight, RefreshCw, Hash, Tag 
} from 'lucide-react'
import { TabContainer } from '@erp-modules/shared'
import { InventoryDashboard } from './InventoryDashboard'
import { ProductList } from './ProductList'
import { CategoryList } from './CategoryList'
import { WarehouseList } from './WarehouseList'
import { StockLevels } from './StockLevels'
import { StockMovements } from './StockMovements'
import { StockAdjustments } from './StockAdjustments'
import { SerialNumbers } from './SerialNumbers'
import { BatchNumbers } from './BatchNumbers'

export function InventoryMain() {
  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      content: <InventoryDashboard />,
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      content: <ProductList />,
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Folder,
      content: <CategoryList />,
    },
    {
      id: 'warehouses',
      label: 'Warehouses',
      icon: Warehouse,
      content: <WarehouseList />,
    },
    {
      id: 'stock',
      label: 'Stock Levels',
      icon: Archive,
      content: <StockLevels />,
    },
    {
      id: 'movements',
      label: 'Movements',
      icon: ArrowRight,
      content: <StockMovements />,
    },
    {
      id: 'adjustments',
      label: 'Adjustments',
      icon: RefreshCw,
      content: <StockAdjustments />,
    },
    {
      id: 'serial',
      label: 'Serial Numbers',
      icon: Hash,
      content: <SerialNumbers />,
    },
    {
      id: 'batch',
      label: 'Batch Numbers',
      icon: Tag,
      content: <BatchNumbers />,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <TabContainer tabs={tabs} defaultTab="dashboard" urlParam="tab" />
      </div>
    </div>
  )
}

export default InventoryMain

