import { useState, useEffect } from 'react'
import Loader from '../components/Loader'

function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, selectedCategory])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/categories/list`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      let url = `${import.meta.env.VITE_API_URL}/api/products?`
      const params = new URLSearchParams()
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }
      
      if (selectedCategory) {
        params.append('category', selectedCategory)
      }
      
      const response = await fetch(url + params.toString())
      if (!response.ok) {
        // If API not ready, show demo data
        setProducts(getDemoProducts())
      } else {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      // Show demo data when API is unavailable
      setProducts(getDemoProducts())
    } finally {
      setLoading(false)
    }
  }

  const getDemoProducts = () => [
    { id: 1, name: 'Tomatoes', price: 40, quantity: 50, category: 'Vegetables', status: 'in-stock', vendor_name: 'Fresh Farms' },
    { id: 2, name: 'Potatoes', price: 25, quantity: 100, category: 'Vegetables', status: 'in-stock', vendor_name: 'Green Valley' },
    { id: 3, name: 'Apples', price: 80, quantity: 30, category: 'Fruits', status: 'in-stock', vendor_name: 'Orchard Fresh' },
    { id: 4, name: 'Bananas', price: 50, quantity: 5, category: 'Fruits', status: 'low-stock', vendor_name: 'Tropical Farms' },
    { id: 5, name: 'Carrots', price: 35, quantity: 0, category: 'Vegetables', status: 'out-of-stock', vendor_name: 'Fresh Farms' },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-stock':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300'
      case 'low-stock':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300'
      case 'out-of-stock':
        return 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-300'
      default:
        return 'bg-gray-50 border border-gray-300'
    }
  }

  const getStatusBadgeColor = (status) => {
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

  const getStatusText = (status) => {
    switch (status) {
      case 'in-stock':
        return 'In Stock'
      case 'low-stock':
        return 'Low Stock'
      case 'out-of-stock':
        return 'Out of Stock'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-12">
        <h2 className="text-5xl font-semibold text-gray-900 mb-3 tracking-tight">Products</h2>
        <p className="text-lg text-gray-500 font-light">Discover fresh produce from local vendors</p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
        <h3 className="text-lg font-semibold text-gray-900 mb-8 uppercase tracking-wider text-center">Search & Explore</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">Search Products</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-base"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-base"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && <Loader />}

      {/* Error State */}
      {error && (
        <div className="bg-white border border-red-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-red-900 mb-2">Error Loading Products</h3>
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200"
          >
            {/* Product Header */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-700 mt-1 font-medium">{product.vendor_name || 'Vendor'}</p>
                </div>
              </div>
              <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                product.status === 'in-stock' ? 'bg-green-50 text-green-700' :
                product.status === 'low-stock' ? 'bg-yellow-50 text-yellow-700' :
                'bg-red-50 text-red-700'
              }`}>
                {getStatusText(product.status)}
              </span>
            </div>

            {/* Product Info */}
            <div className="space-y-3">
              {/* Price */}
              <div>
                <p className="text-sm text-gray-700 font-bold mb-1">Price</p>
                <p className="text-3xl font-bold text-gray-900">₹{product.price}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="text-sm text-gray-700 font-bold">Stock</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{product.quantity} kg</p>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="text-sm text-gray-700 font-bold">Category</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{product.category}</p>
                </div>
              </div>

              {/* Stock Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">Level</span>
                  <span className="text-sm font-bold text-gray-600">{Math.min((product.quantity / 100) * 100, 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      product.status === 'in-stock' ? 'bg-green-600' :
                      product.status === 'low-stock' ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${Math.min((product.quantity / 100) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Button */}
              <button
                className={`w-full py-3 rounded-md font-bold text-base transition-colors ${
                  product.status === 'out-of-stock'
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
                disabled={product.status === 'out-of-stock'}
              >
                {product.status === 'out-of-stock' ? 'Out of Stock' : 'View Details'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && !loading && (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
          <p className="text-3xl mb-4 text-gray-300">−</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">No products found</p>
          <p className="text-base text-gray-700 mb-6">Try adjusting your search or filters</p>
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory('')
            }}
            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-md font-bold text-base transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Summary Footer */}
      {products.length > 0 && (
        <div className="mt-8 p-4 bg-white border border-gray-200 rounded-lg text-center">
          <p className="text-base text-gray-700 font-medium">
            Showing <span className="font-bold text-gray-900">{products.length}</span> product{products.length !== 1 ? 's' : ''}
          </p>
          <p className="text-sm text-gray-600 mt-1 font-medium">Updated {new Date().toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  )
}

export default HomePage
