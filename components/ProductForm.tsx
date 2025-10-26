import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Package, Save, X } from 'lucide-react'

// Form field components
interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

interface InputFieldProps {
  name: string
  type?: string
  placeholder?: string
  disabled?: boolean
  value: string
  onChange: (value: string) => void
  error?: string
}

export function InputField({ 
  name, 
  type = 'text', 
  placeholder, 
  disabled, 
  value, 
  onChange, 
  error 
}: InputFieldProps) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        error ? 'border-red-300' : 'border-gray-300'
      } ${disabled ? 'bg-gray-100' : 'bg-white'}`}
    />
  )
}

interface SelectFieldProps {
  name: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  error?: string
}

export function SelectField({ name, value, onChange, options, error }: SelectFieldProps) {
  return (
    <select
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        error ? 'border-red-300' : 'border-gray-300'
      }`}
    >
      <option value="">Select an option</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

interface TextAreaFieldProps {
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  error?: string
}

export function TextAreaField({ 
  name, 
  value, 
  onChange, 
  placeholder, 
  rows = 3, 
  error 
}: TextAreaFieldProps) {
  return (
    <textarea
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        error ? 'border-red-300' : 'border-gray-300'
      }`}
    />
  )
}

// Product form schema
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be positive'),
  cost: z.number().min(0, 'Cost must be positive').optional(),
  stock_quantity: z.number().min(0, 'Stock quantity must be non-negative'),
  min_stock_level: z.number().min(0, 'Min stock level must be non-negative').optional(),
  status: z.enum(['active', 'inactive']).default('active'),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  initialData?: Partial<ProductFormData>
  onSubmit: (data: ProductFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function ProductForm({ initialData, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      sku: initialData?.sku || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      price: initialData?.price || 0,
      cost: initialData?.cost || 0,
      stock_quantity: initialData?.stock_quantity || 0,
      min_stock_level: initialData?.min_stock_level || 0,
      status: initialData?.status || 'active',
    },
    onSubmit: async ({ value }) => {
      onSubmit(value)
    },
  })

  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'books', label: 'Books' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'beauty', label: 'Beauty & Health' },
    { value: 'toys', label: 'Toys & Games' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Package className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Product Name */}
          <FormField
            label="Product Name"
            required
          >
            <InputField
              name="name"
              value={form.state.values.name}
              onChange={(value) => form.setFieldValue('name', value)}
              placeholder="Enter product name"
            />
          </FormField>

          {/* SKU */}
          <FormField
            label="SKU"
            required
          >
            <InputField
              name="sku"
              value={form.state.values.sku}
              onChange={(value) => form.setFieldValue('sku', value)}
              placeholder="Enter SKU"
            />
          </FormField>

          {/* Category */}
          <FormField
            label="Category"
            required
          >
            <SelectField
              name="category"
              value={form.state.values.category}
              onChange={(value) => form.setFieldValue('category', value)}
              options={categories}
            />
          </FormField>

          {/* Status */}
          <FormField
            label="Status"
          >
            <SelectField
              name="status"
              value={form.state.values.status}
              onChange={(value) => form.setFieldValue('status', value as 'active' | 'inactive')}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </FormField>

          {/* Price */}
          <FormField
            label="Price"
            required
          >
            <InputField
              name="price"
              type="number"
              value={form.state.values.price.toString()}
              onChange={(value) => form.setFieldValue('price', parseFloat(value) || 0)}
              placeholder="0.00"
            />
          </FormField>

          {/* Cost */}
          <FormField
            label="Cost"
          >
            <InputField
              name="cost"
              type="number"
              value={form.state.values.cost?.toString() || '0'}
              onChange={(value) => form.setFieldValue('cost', parseFloat(value) || 0)}
              placeholder="0.00"
            />
          </FormField>

          {/* Stock Quantity */}
          <FormField
            label="Stock Quantity"
            required
          >
            <InputField
              name="stock_quantity"
              type="number"
              value={form.state.values.stock_quantity.toString()}
              onChange={(value) => form.setFieldValue('stock_quantity', parseInt(value) || 0)}
              placeholder="0"
            />
          </FormField>

          {/* Min Stock Level */}
          <FormField
            label="Min Stock Level"
          >
            <InputField
              name="min_stock_level"
              type="number"
              value={form.state.values.min_stock_level?.toString() || '0'}
              onChange={(value) => form.setFieldValue('min_stock_level', parseInt(value) || 0)}
              placeholder="0"
            />
          </FormField>
        </div>

        {/* Description */}
        <FormField
          label="Description"
        >
          <TextAreaField
            name="description"
            value={form.state.values.description}
            onChange={(value) => form.setFieldValue('description', value)}
            placeholder="Enter product description"
            rows={4}
          />
        </FormField>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !form.state.isValid}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {initialData ? 'Update Product' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
