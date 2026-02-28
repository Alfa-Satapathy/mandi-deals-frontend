import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  BarChart3, Package, Users, DollarSign, TrendingUp, Settings, ClipboardList, Gift, Tag
} from 'lucide-react'

// Configure all icons to be bold (strokeWidth=2)
const iconProps = { strokeWidth: 2.5 }
import InventoryManagement from '../components/InventoryManagement'
import DiscountManagement from '../components/DiscountManagement'

function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalSales: 0,
    totalItems: 0,
    totalCustomers: 0,
    avgOrderValue: 0
  })
  const [dailyData, setDailyData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [yearlyData, setYearlyData] = useState([])
  const [customers, setCustomers] = useState([])
  const [sales, setSales] = useState([])
  const [settings, setSettings] = useState({
    tax_percentage: 5,
    points_multiplier: 100, // 100 points = ₹10
    points_conversion_rate: 10, // 1 point = ₹0.1
    max_discount_pct: 50
  })
  const [editingSettings, setEditingSettings] = useState(false)
  const [tempSettings, setTempSettings] = useState(settings)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5000) // 5 seconds
  const [lastRefresh, setLastRefresh] = useState(null)

  useEffect(() => {
    // Initial fetch
    fetchDashboardData()
    
    // Set up auto-refresh interval
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      fetchDashboardData()
    }, refreshInterval)
    
    // Cleanup interval on unmount or when autoRefresh changes
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats
      const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/dashboard/stats`)
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      // Fetch daily data
      const dailyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/dashboard/daily-sales`)
      if (dailyRes.ok) {
        const dailyData = await dailyRes.json()
        setDailyData(dailyData)
      }

      // Fetch monthly data
      const monthlyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/dashboard/monthly-sales`)
      if (monthlyRes.ok) {
        const monthlyData = await monthlyRes.json()
        setMonthlyData(monthlyData)
      }

      // Fetch yearly data
      const yearlyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/dashboard/yearly-sales`)
      if (yearlyRes.ok) {
        const yearlyData = await yearlyRes.json()
        setYearlyData(yearlyData)
      }

      // Fetch customers
      const customersRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/dashboard/customers`)
      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData)
      }

      // Fetch sales
      const salesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/dashboard/sales`)
      if (salesRes.ok) {
        const salesData = await salesRes.json()
        setSales(salesData)
      }

      // Fetch settings
      const settingsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings`)
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        setSettings(settingsData)
        setTempSettings(settingsData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
      setLastRefresh(new Date())
    }
  }

  const saveSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempSettings)
      })

      if (response.ok) {
        setSettings(tempSettings)
        setEditingSettings(false)
        alert('Settings updated successfully!')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    }
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          {lastRefresh && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 bg-white px-3 sm:px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 w-4 h-4 cursor-pointer"
            />
            <span className="hidden sm:inline">Auto-Refresh ({refreshInterval / 1000}s)</span>
            <span className="sm:hidden">Auto ({refreshInterval / 1000}s)</span>
          </label>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-3 sm:px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 font-medium text-xs sm:text-sm whitespace-nowrap"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200 -mx-2 px-2 md:mx-0 md:px-0">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'inventory', label: 'Inventory', icon: Package },
          { id: 'discounts', label: 'Discounts', icon: Tag },
          { id: 'customers', label: 'Customers', icon: Users },
          { id: 'sales', label: 'Sales', icon: DollarSign },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 sm:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div>
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow border-l-4 border-blue-500">
                <p className="text-gray-600 text-xs md:text-sm">Total Sales</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">₹{stats.totalSales?.toFixed(2) || '0.00'}</p>
                <p className="text-xs text-gray-500 mt-1 md:mt-2">All time</p>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-lg shadow border-l-4 border-green-500">
                <p className="text-gray-600 text-xs md:text-sm">Items Sold</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{stats.totalItems || 0}</p>
                <p className="text-xs text-gray-500 mt-1 md:mt-2">Products</p>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-lg shadow border-l-4 border-purple-500">
                <p className="text-gray-600 text-xs md:text-sm">Customers</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{stats.totalCustomers || 0}</p>
                <p className="text-xs text-gray-500 mt-1 md:mt-2">Registered</p>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-lg shadow border-l-4 border-orange-500">
                <p className="text-gray-600 text-xs md:text-sm">Avg. Order</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">₹{stats.avgOrderValue?.toFixed(2) || '0.00'}</p>
                <p className="text-xs text-gray-500 mt-1 md:mt-2">Per transaction</p>
              </div>
            </div>

            {/* Daily Sales Chart */}
            {dailyData.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Sales (Last 7 Days)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="items" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <InventoryManagement />
        )}

        {/* DISCOUNTS TAB */}
        {activeTab === 'discounts' && (
          <DiscountManagement />
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Customers ({customers.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Phone</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Tier</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Purchases</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Points</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No customers yet</td>
                    </tr>
                  ) : (
                    customers.map(customer => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium text-gray-900">{customer.name}</td>
                        <td className="px-6 py-3 text-gray-600">{customer.phone}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            customer.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                            customer.tier === 'Silver' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {customer.tier || 'Standard'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-600">{customer.total_purchases || 0}</td>
                        <td className="px-6 py-3 font-medium text-blue-600">{customer.available_points || 0}</td>
                        <td className="px-6 py-3 text-gray-600 text-xs">{new Date(customer.member_since).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SALES TAB */}
        {activeTab === 'sales' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Sales ({sales.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Transaction ID</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Customer</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Items</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Points Used</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Discount</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No sales yet</td>
                    </tr>
                  ) : (
                    sales.map(sale => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-mono text-xs text-blue-600">{sale.id.substring(0, 8)}</td>
                        <td className="px-6 py-3 text-gray-900">{sale.customer_name || 'Cash Sale'}</td>
                        <td className="px-6 py-3 text-gray-600">{sale.items_count || 0}</td>
                        <td className="px-6 py-3 font-semibold text-gray-900">₹{sale.total_amount?.toFixed(2)}</td>
                        <td className="px-6 py-3 text-gray-600">{sale.points_used || 0} pts</td>
                        <td className="px-6 py-3 text-red-600">-₹{sale.discount_amount?.toFixed(2)}</td>
                        <td className="px-6 py-3 text-gray-600 text-xs">{new Date(sale.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Monthly Sales */}
            {monthlyData.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Sales</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#3b82f6" />
                    <Bar dataKey="items" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Yearly Sales */}
            {yearlyData.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Yearly Sales</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Sales by Category Pie Chart */}
            {sales.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sales.slice(0, 5)}
                      dataKey="total_amount"
                      nameKey="customer_name"
                      cx="50%"
                      cy="50%"
                      fill="#8884d8"
                      label
                    >
                      {sales.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">System Settings</h2>
              {!editingSettings ? (
                <button
                  onClick={() => {
                    setEditingSettings(true)
                    setTempSettings(settings)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors text-sm sm:text-base"
                >
                  ✎ Edit Settings
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={saveSettings}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors text-sm sm:text-base"
                  >
                    ✓ Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingSettings(false)
                      setTempSettings(settings)
                    }}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded font-medium transition-colors text-sm sm:text-base"
                  >
                    ✕ Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-8">
              {/* Financial Settings */}
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2"><DollarSign size={20} strokeWidth={2.5} className="text-gray-700" />Financial Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Tax Percentage (%)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={editingSettings ? tempSettings.tax_percentage : settings.tax_percentage}
                        onChange={(e) => editingSettings && setTempSettings({
                          ...tempSettings,
                          tax_percentage: parseFloat(e.target.value)
                        })}
                        disabled={!editingSettings}
                        className="w-24 px-3 py-2 border border-gray-300 rounded disabled:bg-gray-100 disabled:text-gray-600"
                      />
                      <span className="text-gray-600">%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Applied on all transactions</p>
                    {!editingSettings && (
                      <p className="text-lg font-semibold text-blue-600 mt-3">
                        Current: {settings.tax_percentage}% GST
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Max Discount Allowed (%)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={editingSettings ? tempSettings.max_discount_pct : settings.max_discount_pct}
                        onChange={(e) => editingSettings && setTempSettings({
                          ...tempSettings,
                          max_discount_pct: parseInt(e.target.value)
                        })}
                        disabled={!editingSettings}
                        className="w-24 px-3 py-2 border border-gray-300 rounded disabled:bg-gray-100 disabled:text-gray-600"
                      />
                      <span className="text-gray-600">% of bill</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Maximum points discount on a single bill</p>
                    {!editingSettings && (
                      <p className="text-lg font-semibold text-blue-600 mt-3">
                        Current: Max {settings.max_discount_pct}% discount
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Points Settings */}
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2"><Gift size={20} strokeWidth={2.5} className="text-gray-700" />Points Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Points Earned Per ₹ (Multiplier)
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">₹1 =</span>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={editingSettings ? (100 / tempSettings.points_multiplier) : (100 / settings.points_multiplier)}
                        onChange={(e) => editingSettings && setTempSettings({
                          ...tempSettings,
                          points_multiplier: 100 / parseFloat(e.target.value)
                        })}
                        disabled={!editingSettings}
                        className="w-24 px-3 py-2 border border-gray-300 rounded disabled:bg-gray-100 disabled:text-gray-600"
                      />
                      <span className="text-gray-600">points</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">How many points customers earn per rupee spent</p>
                    {!editingSettings && (
                      <p className="text-lg font-semibold text-blue-600 mt-3">
                        Current: ₹1 = {(100 / settings.points_multiplier).toFixed(1)} points
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Points Redemption Rate
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={editingSettings ? tempSettings.points_conversion_rate : settings.points_conversion_rate}
                        onChange={(e) => editingSettings && setTempSettings({
                          ...tempSettings,
                          points_conversion_rate: parseInt(e.target.value)
                        })}
                        disabled={!editingSettings}
                        className="w-24 px-3 py-2 border border-gray-300 rounded disabled:bg-gray-100 disabled:text-gray-600"
                      />
                      <span className="text-gray-600">points = ₹1</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">How many points customer needs to redeem for ₹1 discount</p>
                    {!editingSettings && (
                      <p className="text-lg font-semibold text-blue-600 mt-3">
                        Current: {settings.points_conversion_rate} points = ₹1
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Settings Info</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Tax Percentage: Applied to subtotal before points discount</li>
                  <li>• Points Earned: 1 rupee = points as per multiplier (default: ₹1 = 1pt)</li>
                  <li>• Points Redemption: How many points = ₹1 discount (default: 10pts = ₹1)</li>
                  <li>• All changes apply to future transactions immediately</li>
                </ul>
              </div>

              {/* Current Settings Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><ClipboardList size={18} strokeWidth={2.5} className="text-gray-700" />Current Configuration Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-gray-600">Tax Rate</p>
                    <p className="text-xl font-bold text-gray-900">{settings.tax_percentage}%</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-gray-600">Points/₹</p>
                    <p className="text-xl font-bold text-gray-900">{(100 / settings.points_multiplier).toFixed(1)}</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-gray-600">Redeem Rate</p>
                    <p className="text-xl font-bold text-gray-900">{settings.points_conversion_rate}</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-gray-600">Max Discount</p>
                    <p className="text-xl font-bold text-gray-900">{settings.max_discount_pct}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
