import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react'
import Modal from './Modal'
import Toast from './Toast'

function InventoryManagement() {
  const [inventory, setInventory] = useState([])
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [toast, setToast] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    current_stock: '',
    unit: 'kg'
  })

  // Fetch inventory data
  useEffect(() => {
    fetchInventory()
    fetchCategories()
    fetchStats()
  }, [])

  const fetchInventory = async (category = 'all', search = '', status = 'all') => {
    try {
      setLoading(true)
      const url = new URL(`${import.meta.env.VITE_API_URL}/api/admin/inventory/list`)
      if (category !== 'all') url.searchParams.append('category', category)
      if (search) url.searchParams.append('search', search)
      if (status !== 'all') url.searchParams.append('status', status)

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setInventory(data)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
      showToast('Failed to fetch inventory', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/inventory/categories`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/inventory/stats`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    fetchInventory(selectedCategory, term, selectedStatus)
  }

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category)
    fetchInventory(category, searchTerm, selectedStatus)
  }

  const handleStatusFilter = (status) => {
    setSelectedStatus(status)
    fetchInventory(selectedCategory, searchTerm, status)
  }

  const handleAddProduct = async () => {
    if (!formData.name || !formData.category || !formData.price || formData.current_stock === '') {
      showToast('Please fill all required fields', 'error')
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/inventory/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          current_stock: parseFloat(formData.current_stock),
          unit: formData.unit
        })
      })

      if (response.ok) {
        showToast('Product added successfully!')
        setFormData({ name: '', category: '', price: '', current_stock: '', unit: 'kg' })
        setShowAddModal(false)
        fetchInventory(selectedCategory, searchTerm, selectedStatus)
        fetchStats()
      } else {
        const error = await response.json()
        showToast(error.error || 'Failed to add product', 'error')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      showToast('Error adding product', 'error')
    }
  }

  const handleUpdateProduct = async () => {
    if (!selectedProduct.name || !selectedProduct.category || !selectedProduct.price || selectedProduct.current_stock === '') {
      showToast('Please fill all required fields', 'error')
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/inventory/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedProduct.name,
          category: selectedProduct.category,
          price: parseFloat(selectedProduct.price),
          current_stock: parseFloat(selectedProduct.current_stock),
          unit: selectedProduct.unit
        })
      })

      if (response.ok) {
        showToast('Product updated successfully!')
        setShowEditModal(false)
        setSelectedProduct(null)
        fetchInventory(selectedCategory, searchTerm, selectedStatus)
        fetchStats()
      } else {
        const error = await response.json()
        showToast(error.error || 'Failed to update product', 'error')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      showToast('Error updating product', 'error')
    }
  }

  const handleDeleteProduct = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/inventory/${selectedProduct.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        showToast('Product deleted successfully!')
        setShowDeleteModal(false)
        setSelectedProduct(null)
        fetchInventory(selectedCategory, searchTerm, selectedStatus)
        fetchStats()
      } else {
        const error = await response.json()
        showToast(error.error || 'Failed to delete product', 'error')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      showToast('Error deleting product', 'error')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-800'
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800'
      case 'out-of-stock':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'in-stock':
        return '✓ In Stock'
      case 'low-stock':
        return '⚠ Low Stock'
      case 'out-of-stock':
        return '✕ Out of Stock'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header and Stats */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Package size={24} strokeWidth={2.5} className="text-gray-700" />Inventory Management</h2>
          <button
            onClick={() => {
              setFormData({ name: '', category: '', price: '', current_stock: '', unit: 'kg' })
              setShowAddModal(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + Add Product
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
              <p className="text-gray-600 text-sm">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
              <p className="text-gray-600 text-sm">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.lowStockCount}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
              <p className="text-gray-600 text-sm">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.outOfStockCount}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
              <p className="text-gray-600 text-sm">Total Inventory Value</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">₹{stats.totalInventoryValue?.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by product name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="in-stock">✓ In Stock</option>
              <option value="low-stock">⚠ Low Stock</option>
              <option value="out-of-stock">✕ Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Products ({inventory.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Product Name</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Category</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Price</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Stock</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Unit</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Total Value</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    {loading ? 'Loading...' : 'No products found'}
                  </td>
                </tr>
              ) : (
                inventory.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-3 text-gray-600">{product.category}</td>
                    <td className="px-6 py-3 font-semibold text-gray-900">₹{parseFloat(product.price).toFixed(2)}</td>
                    <td className="px-6 py-3 text-gray-600">{parseFloat(product.current_stock).toFixed(2)}</td>
                    <td className="px-6 py-3 text-gray-600">{product.unit}</td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(product.status)}`}>
                        {getStatusLabel(product.status)}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-900">
                      ₹{(parseFloat(product.price) * parseFloat(product.current_stock)).toFixed(2)}
                    </td>
                    <td className="px-6 py-3 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(product)
                          setShowEditModal(true)
                        }}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition font-medium"
                      >
                        ✎ Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(product)
                          setShowDeleteModal(true)
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition font-medium"
                      >
                        ✕ Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddModal}
        title="Add New Product"
        onClose={() => setShowAddModal(false)}
        buttons={[
          { label: 'Cancel', onClick: () => setShowAddModal(false), variant: 'secondary' },
          { label: 'Add Product', onClick: handleAddProduct, variant: 'primary' }
        ]}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Category *</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Vegetables, Fruits"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {categories.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                Or select: {categories.slice(0, 5).join(', ')}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Stock Qty *</label>
              <input
                type="number"
                step="0.01"
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Unit</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="kg">kg</option>
              <option value="pieces">pieces</option>
              <option value="dozen">dozen</option>
              <option value="box">box</option>
              <option value="liter">liter</option>
              <option value="gram">gram</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      {selectedProduct && (
        <Modal
          isOpen={showEditModal}
          title="Edit Product"
          onClose={() => {
            setShowEditModal(false)
            setSelectedProduct(null)
          }}
          buttons={[
            { label: 'Cancel', onClick: () => { setShowEditModal(false); setSelectedProduct(null); }, variant: 'secondary' },
            { label: 'Update Product', onClick: handleUpdateProduct, variant: 'primary' }
          ]}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Product Name</label>
              <input
                type="text"
                value={selectedProduct.name}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Category</label>
              <input
                type="text"
                value={selectedProduct.category}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={selectedProduct.price}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Stock Qty</label>
                <input
                  type="number"
                  step="0.01"
                  value={selectedProduct.current_stock}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, current_stock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Unit</label>
              <select
                value={selectedProduct.unit}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="kg">kg</option>
                <option value="pieces">pieces</option>
                <option value="dozen">dozen</option>
                <option value="box">box</option>
                <option value="liter">liter</option>
                <option value="gram">gram</option>
              </select>
            </div>
            <div className="bg-blue-50 p-3 rounded border border-blue-200 text-xs text-blue-700">
              <p><strong>Current Status:</strong> {selectedProduct.status}</p>
              <p><strong>Total Value:</strong> ₹{(parseFloat(selectedProduct.price) * parseFloat(selectedProduct.current_stock)).toFixed(2)}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {selectedProduct && (
        <Modal
          isOpen={showDeleteModal}
          title="Delete Product"
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedProduct(null)
          }}
          buttons={[
            { label: 'Cancel', onClick: () => { setShowDeleteModal(false); setSelectedProduct(null); }, variant: 'secondary' },
            { label: 'Delete', onClick: handleDeleteProduct, variant: 'danger' }
          ]}
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete <strong>{selectedProduct.name}</strong>?
            </p>
            <p className="text-sm text-red-600">
              ⚠️ This action cannot be undone. The product will be permanently removed from your inventory.
            </p>
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <p className="text-sm text-red-700">
                <strong>Product Details:</strong><br/>
                Category: {selectedProduct.category}<br/>
                Price: ₹{parseFloat(selectedProduct.price).toFixed(2)}<br/>
                Stock: {parseFloat(selectedProduct.current_stock).toFixed(2)} {selectedProduct.unit}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default InventoryManagement
