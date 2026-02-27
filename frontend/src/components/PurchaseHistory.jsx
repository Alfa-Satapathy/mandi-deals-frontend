import React, { useState, useEffect } from 'react';

const PurchaseHistory = ({ customerId }) => {
  const [purchases, setPurchases] = useState([]);
  const [summary, setSummary] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (customerId) {
      fetchPurchaseHistory();
      fetchSummary();
      fetchSuggestions();
    }
  }, [customerId]);

  const fetchPurchaseHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/purchase-history/customer/${customerId}?limit=50`);
      const data = await response.json();
      setPurchases(data.purchases || []);
    } catch (error) {
      console.error('Error fetching purchase history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/purchase-history/customer/${customerId}/summary`);
      const data = await response.json();
      setSummary(data.summary || {});
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/purchase-history/customer/${customerId}/reorder-suggestions`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading purchase history...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">📜 Purchase History</h2>

      {/* Summary Section */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-gray-600 text-sm">Total Purchases</p>
            <p className="text-2xl font-bold text-blue-600">{summary.total_purchases || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-gray-600 text-sm">Total Spent</p>
            <p className="text-2xl font-bold text-green-600">₹{(summary.total_spent || 0).toFixed(2)}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-gray-600 text-sm">Avg Purchase</p>
            <p className="text-2xl font-bold text-orange-600">₹{(summary.avg_purchase_value || 0).toFixed(2)}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-gray-600 text-sm">Points Earned</p>
            <p className="text-2xl font-bold text-purple-600">{summary.total_points_earned || 0}</p>
          </div>
        </div>
      )}

      {/* Reorder Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3">💡 Reorder Suggestions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {suggestions.slice(0, 4).map(product => (
              <div key={product.id} className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                <p className="font-semibold text-sm">{product.name}</p>
                <p className="text-xs text-gray-600">₹{product.price}</p>
                <p className="text-xs text-yellow-600 font-semibold">Bought {product.purchase_frequency}x</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Purchases List */}
      <h3 className="text-lg font-bold mb-3">Recent Transactions</h3>
      {purchases.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No purchase history found</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {purchases.map((purchase) => (
            <div 
              key={purchase.id} 
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
              onClick={() => setSelectedTransaction(purchase)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">Transaction #{purchase.id.slice(-8)}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(purchase.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">₹{purchase.total_amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-600">{purchase.payment_method}</p>
                </div>
              </div>

              {purchase.items && (
                <div className="bg-gray-50 p-2 rounded text-sm mb-2">
                  <p className="text-gray-700">{purchase.items.length} items</p>
                </div>
              )}

              {purchase.discount_amount > 0 && (
                <p className="text-sm text-orange-600 font-semibold">
                  💰 Discount: -₹{purchase.discount_amount.toFixed(2)}
                </p>
              )}

              {purchase.points_earned > 0 && (
                <p className="text-sm text-purple-600 font-semibold">
                  ⭐ Points Earned: +{purchase.points_earned}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Transaction Details</h3>
              <button onClick={() => setSelectedTransaction(null)} className="text-red-500">✕</button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="border-b pb-2">
                <p className="text-sm text-gray-600">Transaction ID</p>
                <p className="font-mono text-sm">{selectedTransaction.id}</p>
              </div>

              <div className="border-b pb-2">
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="text-sm">{new Date(selectedTransaction.created_at).toLocaleString()}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Items ({selectedTransaction.items?.length || 0})</p>
                <div className="bg-gray-50 p-2 rounded max-h-40 overflow-y-auto">
                  {selectedTransaction.items?.map((item) => (
                    <div key={item.id} className="text-sm mb-1 flex justify-between">
                      <span>{item.name} x {item.quantity}</span>
                      <span className="font-semibold">₹{item.total_price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-2 mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{(selectedTransaction.total_amount + selectedTransaction.discount_amount).toFixed(2)}</span>
                </div>
                {selectedTransaction.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Discount:</span>
                    <span>-₹{selectedTransaction.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-1">
                  <span>Total:</span>
                  <span className="text-green-600">₹{selectedTransaction.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedTransaction(null)}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;
