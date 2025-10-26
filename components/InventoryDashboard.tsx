import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Plus, Search, Filter, Package, Edit, Trash2, Eye, BarChart3, 
  TrendingUp, TrendingDown, Calendar, AlertTriangle, CheckCircle, 
  Clock, Download, Upload, Settings, Zap, Bell, Globe, 
  FileText, PieChart, LineChart, Activity, Target, 
  RefreshCw, Play, Pause, MoreHorizontal, Star, DollarSign, X,
  MapPin, Truck, Users, Shield, Smartphone, Camera, QrCode,
  Layers, RotateCcw, Archive, AlertCircle, CheckSquare,
  ArrowUpDown, ArrowRightLeft, ArrowDownUp, ArrowLeftRight,
  Calculator, Percent, Hash, Tag, Barcode, ScanLine,
  Database, Cloud, Wifi, WifiOff, Signal, Battery,
  Thermometer, Droplets, Sun, Moon, Wind, Snowflake
} from 'lucide-react'
import { DataTable } from '../../components/table/DataTable'
import { api } from '../../lib/api'

interface AdvancedProduct {
  id: string
  sku: string
  name: string
  description: string
  category: string
  brand: string
  model: string
  barcode: string
  qr_code: string
  price: number
  cost: number
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  unit_of_measure: string
  min_stock_level: number
  max_stock_level: number
  reorder_point: number
  reorder_quantity: number
  lead_time_days: number
  supplier_id: string
  supplier_name: string
  location_id: string
  location_name: string
  bin_location: string
  serial_tracking: boolean
  batch_tracking: boolean
  expiry_tracking: boolean
  temperature_sensitive: boolean
  hazardous: boolean
  fragile: boolean
  status: 'active' | 'inactive' | 'discontinued'
  images: string[]
  documents: string[]
  tags: string[]
  created_at: string
  updated_at: string
}

interface StockMovement {
  id: string
  product_id: string
  product_name: string
  movement_type: 'in' | 'out' | 'transfer' | 'adjustment'
  quantity: number
  from_location: string
  to_location: string
  reference_number: string
  reason: string
  user_id: string
  user_name: string
  timestamp: string
  batch_number?: string
  serial_numbers?: string[]
  expiry_date?: string
}

interface InventoryAlert {
  id: string
  product_id: string
  product_name: string
  alert_type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiry' | 'reorder'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  current_quantity: number
  threshold_quantity: number
  location: string
  created_at: string
  acknowledged: boolean
  acknowledged_by?: string
  acknowledged_at?: string
}

interface CycleCount {
  id: string
  count_name: string
  location_id: string
  location_name: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  scheduled_date: string
  started_at?: string
  completed_at?: string
  total_items: number
  counted_items: number
  discrepancies: number
  accuracy_percentage: number
  assigned_to: string
  created_by: string
  created_at: string
}

interface Supplier {
  id: string
  name: string
  contact_person: string
  email: string
  phone: string
  address: string
  rating: number
  lead_time_days: number
  minimum_order_amount: number
  payment_terms: string
  status: 'active' | 'inactive'
  products_count: number
  total_value: number
}

interface Location {
  id: string
  name: string
  type: 'warehouse' | 'store' | 'office' | 'external'
  address: string
  capacity: number
  current_utilization: number
  temperature_controlled: boolean
  humidity_controlled: boolean
  security_level: 'low' | 'medium' | 'high'
  manager: string
  status: 'active' | 'inactive'
}

export function AdvancedInventoryManagement() {
  const [activeTab, setActiveTab] = useState('products')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [showProductForm, setShowProductForm] = useState(false)
  const [showCycleCountForm, setShowCycleCountForm] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<AdvancedProduct | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const queryClient = useQueryClient()

  // Fetch products with advanced filtering
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['advanced-products', currentPage, searchQuery, selectedCategory, selectedStatus, selectedLocation],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      })
      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedStatus) params.append('status', selectedStatus)
      if (selectedLocation) params.append('location_id', selectedLocation)
      
      const response = await api.get(`/inventory/products/advanced?${params}`)
      return response.data
    },
  })

  // Fetch stock movements
  const { data: movementsData } = useQuery({
    queryKey: ['stock-movements'],
    queryFn: async () => {
      const response = await api.get('/inventory/movements')
      return response.data.data as StockMovement[]
    },
  })

  // Fetch alerts
  const { data: alertsData } = useQuery({
    queryKey: ['inventory-alerts'],
    queryFn: async () => {
      const response = await api.get('/inventory/alerts')
      return response.data.data as InventoryAlert[]
    },
  })

  // Fetch cycle counts
  const { data: cycleCountsData } = useQuery({
    queryKey: ['cycle-counts'],
    queryFn: async () => {
      const response = await api.get('/inventory/cycle-counts')
      return response.data.data as CycleCount[]
    },
  })

  // Fetch suppliers
  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const response = await api.get('/inventory/suppliers')
      return response.data.data as Supplier[]
    },
  })

  // Fetch locations
  const { data: locationsData } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await api.get('/inventory/locations')
      return response.data.data as Location[]
    },
  })

  // Create product mutation
  const createProduct = useMutation({
    mutationFn: async (productData: Partial<AdvancedProduct>) => {
      const response = await api.post('/inventory/products', productData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-products'] })
      setShowProductForm(false)
    },
  })

  // Update product mutation
  const updateProduct = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AdvancedProduct> }) => {
      const response = await api.put(`/inventory/products/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-products'] })
    },
  })

  // Delete product mutation
  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/inventory/products/${productId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-products'] })
    },
  })

  // Create cycle count mutation
  const createCycleCount = useMutation({
    mutationFn: async (cycleCountData: Partial<CycleCount>) => {
      const response = await api.post('/inventory/cycle-counts', cycleCountData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle-counts'] })
      setShowCycleCountForm(false)
    },
  })

  // Acknowledge alert mutation
  const acknowledgeAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await api.post(`/inventory/alerts/${alertId}/acknowledge`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] })
    },
  })

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct.mutate(productId)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'discontinued': 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800',
    }
    return colors[severity] || 'bg-gray-100 text-gray-800'
  }

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'in': return <ArrowDownUp className="h-4 w-4 text-green-600" />
      case 'out': return <ArrowUpDown className="h-4 w-4 text-red-600" />
      case 'transfer': return <ArrowRightLeft className="h-4 w-4 text-blue-600" />
      case 'adjustment': return <ArrowLeftRight className="h-4 w-4 text-orange-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getCycleCountStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'planned': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const products = productsData?.data?.products || []
  const movements = movementsData || []
  const alerts = alertsData || []
  const cycleCounts = cycleCountsData || []
  const suppliers = suppliersData || []
  const locations = locationsData || []

  const productColumns = [
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }: any) => (
        <div className="flex items-center">
          <Package className="h-4 w-4 text-blue-600 mr-2" />
          <div>
            <div className="font-medium text-gray-900">{row.getValue('sku')}</div>
            <div className="text-sm text-gray-500">{row.original.name}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }: any) => (
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
          {row.getValue('category')}
        </span>
      ),
    },
    {
      accessorKey: 'location_name',
      header: 'Location',
      cell: ({ row }: any) => (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm">{row.getValue('location_name')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'current_stock',
      header: 'Stock',
      cell: ({ row }: any) => {
        const currentStock = row.original.current_stock || 0
        const minStock = row.original.min_stock_level || 0
        const isLowStock = currentStock <= minStock
        
        return (
          <div className="flex items-center">
            <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
              {currentStock}
            </span>
            {isLowStock && <AlertTriangle className="h-4 w-4 text-red-500 ml-1" />}
          </div>
        )
      },
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }: any) => (
        <span className="font-medium text-green-600">
          ${row.getValue('price')?.toFixed(2) || '0.00'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status')
        return (
          <span className={`px-2 py-1 text-xs rounded ${getStatusColor(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )
      },
    },
    {
      accessorKey: 'tracking',
      header: 'Tracking',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-1">
          {row.original.serial_tracking && <Hash className="h-3 w-3 text-blue-600" />}
          {row.original.batch_tracking && <Layers className="h-3 w-3 text-green-600" />}
          {row.original.expiry_tracking && <Calendar className="h-3 w-3 text-orange-600" />}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedProduct(row.original)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelectedProduct(row.original)}
            className="p-1 text-green-600 hover:text-green-800"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteProduct(row.original.id)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Package className="h-6 w-6 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Advanced Inventory Management</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowBarcodeScanner(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Barcode className="h-4 w-4 mr-2" />
            Scan Barcode
          </button>
          <button
            onClick={() => setShowCycleCountForm(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Cycle Count
          </button>
          <button
            onClick={() => setShowProductForm(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Alerts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {alerts.filter(a => !a.acknowledged).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Calculator className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Cycle Counts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {cycleCounts.filter(c => c.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Suppliers</p>
              <p className="text-2xl font-semibold text-gray-900">{suppliers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'products', label: 'Products', icon: Package },
            { id: 'movements', label: 'Stock Movements', icon: ArrowRightLeft },
            { id: 'alerts', label: 'Alerts', icon: Bell },
            { id: 'cycle-counts', label: 'Cycle Counts', icon: Calculator },
            { id: 'suppliers', label: 'Suppliers', icon: Truck },
            { id: 'locations', label: 'Locations', icon: MapPin },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
                <option value="home">Home & Garden</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('')
                  setSelectedStatus('')
                  setSelectedLocation('')
                }}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow">
            <DataTable
              data={products}
              columns={productColumns}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Stock Movements Tab */}
      {activeTab === 'movements' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Stock Movements</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {movements.slice(0, 10).map((movement) => (
                <div key={movement.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    {getMovementTypeIcon(movement.movement_type)}
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {movement.product_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {movement.movement_type.toUpperCase()} • {movement.quantity} units
                      </div>
                      <div className="text-xs text-gray-400">
                        {movement.from_location} → {movement.to_location}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {movement.user_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(movement.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {alerts.filter(a => !a.acknowledged).map((alert) => (
                <div key={alert.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 text-orange-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {alert.product_name}
                      </div>
                      <div className="text-sm text-gray-500">{alert.message}</div>
                      <div className="text-xs text-gray-400">
                        Current: {alert.current_quantity} • Threshold: {alert.threshold_quantity}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <button
                      onClick={() => acknowledgeAlert.mutate(alert.id)}
                      className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cycle Counts Tab */}
      {activeTab === 'cycle-counts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Cycle Counts</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {cycleCounts.map((count) => (
                <div key={count.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Calculator className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {count.count_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {count.location_name} • {count.total_items} items
                      </div>
                      <div className="text-xs text-gray-400">
                        Progress: {count.counted_items}/{count.total_items} ({count.accuracy_percentage.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${getCycleCountStatusColor(count.status)}`}>
                      {count.status.replace('_', ' ')}
                    </span>
                    <button className="p-1 text-blue-600 hover:text-blue-800">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Suppliers</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Truck className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {supplier.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {supplier.contact_person} • {supplier.email}
                      </div>
                      <div className="text-xs text-gray-400">
                        {supplier.products_count} products • {supplier.lead_time_days} days lead time
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < supplier.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {supplier.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Locations Tab */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Locations</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {locations.map((location) => (
                <div key={location.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {location.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {location.address} • {location.type}
                      </div>
                      <div className="text-xs text-gray-400">
                        Utilization: {location.current_utilization}/{location.capacity} ({((location.current_utilization / location.capacity) * 100).toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {location.temperature_controlled && <Thermometer className="h-4 w-4 text-blue-600" />}
                    {location.humidity_controlled && <Droplets className="h-4 w-4 text-blue-600" />}
                    <span className={`px-2 py-1 text-xs rounded ${
                      location.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {location.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Product</h3>
              <button
                onClick={() => setShowProductForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select Category</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="books">Books</option>
                    <option value="home">Home & Garden</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Stock</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="ml-2 text-sm text-gray-700">Serial Tracking</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="ml-2 text-sm text-gray-700">Batch Tracking</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="ml-2 text-sm text-gray-700">Expiry Tracking</span>
                </label>
              </div>
            </form>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowProductForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => createProduct.mutate({})}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
              >
                Create Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cycle Count Form Modal */}
      {showCycleCountForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Cycle Count</h3>
              <button
                onClick={() => setShowCycleCountForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Count Name</label>
                <input
                  type="text"
                  placeholder="Enter count name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Location</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>{location.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowCycleCountForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => createCycleCount.mutate({})}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
              >
                Create Count
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Barcode Scanner</h3>
              <button
                onClick={() => setShowBarcodeScanner(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-8 mb-4">
                <Camera className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Position barcode in front of camera</p>
              </div>
              
              <div className="space-y-2">
                <button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700">
                  Start Scanning
                </button>
                <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Manual Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
