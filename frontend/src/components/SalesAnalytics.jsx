import React, { useState, useEffect } from 'react';

const SalesAnalytics = () => {
  const [revenue, setRevenue] = useState(null);
  const [dailySales, setDailySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [discountImpact, setDiscountImpact] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAllAnalytics();
  }, [timeRange]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      const [revRes, dailyRes, topRes, catRes, discRes, payRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/revenue/summary`),
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/sales/daily?days=${timeRange}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/products/top-selling?days=${timeRange}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/sales/by-category?days=${timeRange}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/discount-impact?days=${timeRange}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/payment-methods?days=${timeRange}`)
      ]);

      if (revRes.ok) setRevenue((await revRes.json()).all_time || {});
      if (dailyRes.ok) setDailySales((await dailyRes.json()).daily_sales || []);
      if (topRes.ok) setTopProducts((await topRes.json()).top_products || []);
      if (catRes.ok) setCategoryStats((await catRes.json()).sales_by_category || []);
      if (discRes.ok) setDiscountImpact((await discRes.json()).discount_impact || {});
      if (payRes.ok) setPaymentMethods((await payRes.json()).payment_methods || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, unit = '' }) => (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {value.toLocaleString()} {unit}
          </p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="p-4">Loading analytics...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📈 Sales Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(parseInt(e.target.value))}
          className="border rounded px-3 py-2"
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
          <option value={365}>Last Year</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon="💰"
          title="Total Sales"
          value={revenue?.total_sales || 0}
          unit="₹"
        />
        <StatCard 
          icon="🛒"
          title="Transactions"
          value={revenue?.transaction_count || 0}
        />
        <StatCard 
          icon="👥"
          title="Total Customers"
          value={revenue?.total_customers || 0}
        />
        <StatCard 
          icon="📊"
          title="Avg Transaction"
          value={revenue?.avg_transaction || 0}
          unit="₹"
        />
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-bold mb-4">🏆 Top Selling Products</h3>
          {topProducts.length === 0 ? (
            <p className="text-gray-500">No data available</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {topProducts.slice(0, 10).map((product, idx) => (
                <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{idx + 1}. {product.name}</p>
                    <p className="text-xs text-gray-600">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">₹{product.total_revenue?.toFixed(2) || 0}</p>
                    <p className="text-xs text-gray-600">{product.times_sold} sales</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sales by Category */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-bold mb-4">📦 Sales by Category</h3>
          {categoryStats.length === 0 ? (
            <p className="text-gray-500">No data available</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categoryStats.map((category) => (
                <div key={category.category} className="p-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold text-sm">{category.category}</p>
                    <p className="text-sm font-bold text-green-600">₹{category.total_revenue?.toFixed(2) || 0}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (category.total_revenue / (categoryStats[0]?.total_revenue || 1)) * 100)}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {category.transaction_count} transactions • {category.total_items_sold} items
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Methods & Discount Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-bold mb-4">💳 Payment Methods</h3>
          {paymentMethods.length === 0 ? (
            <p className="text-gray-500">No data available</p>
          ) : (
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <div key={method.payment_method} className="p-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold text-sm capitalize">{method.payment_method || 'Unknown'}</p>
                    <p className="text-sm font-bold">₹{method.total_amount?.toFixed(2) || 0}</p>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{method.transaction_count} transactions</span>
                    <span>Avg: ₹{method.avg_amount?.toFixed(2) || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-bold mb-4">🎟️ Discount Impact</h3>
          {discountImpact ? (
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded border border-orange-200">
                <p className="text-sm text-gray-600">Total Discount Given</p>
                <p className="text-2xl font-bold text-orange-600">₹{discountImpact.total_discount_given?.toFixed(2) || 0}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-gray-600">Transactions with Discount</p>
                <p className="text-2xl font-bold text-blue-600">{discountImpact.transactions_with_discount || 0}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded border border-purple-200">
                <p className="text-sm text-gray-600">Discount as % of Revenue</p>
                <p className="text-2xl font-bold text-purple-600">{discountImpact.discount_percentage || 0}%</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No discount data available</p>
          )}
        </div>
      </div>

      {/* Daily Sales Trend */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-bold mb-4">📊 Daily Sales Trend</h3>
        {dailySales.length === 0 ? (
          <p className="text-gray-500">No data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-right py-2 px-2">Transactions</th>
                  <th className="text-right py-2 px-2">Revenue</th>
                  <th className="text-right py-2 px-2">Avg Sale</th>
                  <th className="text-right py-2 px-2">Customers</th>
                </tr>
              </thead>
              <tbody>
                {dailySales.slice(0, 10).map((day) => (
                  <tr key={day.date} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2">{new Date(day.date).toLocaleDateString()}</td>
                    <td className="text-right py-2 px-2">{day.transaction_count}</td>
                    <td className="text-right py-2 px-2 font-semibold">₹{day.total_sales?.toFixed(2) || 0}</td>
                    <td className="text-right py-2 px-2">₹{day.avg_transaction?.toFixed(2) || 0}</td>
                    <td className="text-right py-2 px-2">{day.unique_customers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesAnalytics;
