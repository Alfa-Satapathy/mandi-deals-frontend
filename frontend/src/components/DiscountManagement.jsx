import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage', // percentage or fixed
    value: '',
    applicable_to: 'all', // all, category, product
    products: [],
    categories: []
  });

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/discounts/all`);
      const data = await response.json();
      setDiscounts(data.discounts || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      setMessage('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/categories/list`);
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreateDiscount = async () => {
    if (!formData.name || !formData.value) {
      setMessage('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        value: parseFloat(formData.value),
        applicable_to: formData.applicable_to,
        created_by: 'current-user', // Replace with actual user ID
        products: formData.applicable_to === 'product' ? formData.products : [],
        categories: formData.applicable_to === 'category' ? formData.categories : []
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/discounts/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setMessage('Discount created successfully!');
        setShowModal(false);
        setFormData({
          name: '',
          description: '',
          type: 'percentage',
          value: '',
          applicable_to: 'all',
          products: [],
          categories: []
        });
        fetchDiscounts();
      } else {
        setMessage('Failed to create discount');
      }
    } catch (error) {
      console.error('Error creating discount:', error);
      setMessage('Error creating discount');
    }
  };

  const handleToggleActive = async (discountId, isActive) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/discounts/${discountId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      });

      if (response.ok) {
        fetchDiscounts();
        setMessage('Discount updated!');
      }
    } catch (error) {
      console.error('Error updating discount:', error);
      setMessage('Failed to update discount');
    }
  };

  const handleDeleteDiscount = async (discountId) => {
    if (!window.confirm('Are you sure you want to delete this discount?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/discounts/${discountId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchDiscounts();
        setMessage('Discount deleted!');
      }
    } catch (error) {
      console.error('Error deleting discount:', error);
      setMessage('Failed to delete discount');
    }
  };

  const getApplicableToLabel = (applicableTo) => {
    const labels = {
      'all': '🌍 All Products',
      'category': '📦 Category-Based',
      'product': '🎯 Specific Products'
    };
    return labels[applicableTo] || applicableTo;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">💰 Discount Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
        >
          + New Discount
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
          {message}
          <button 
            onClick={() => setMessage('')}
            className="float-right text-lg"
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading discounts...</p>
      ) : discounts.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No discounts created yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {discounts.map(discount => (
            <div key={discount.id} className={`border-2 rounded-lg p-4 ${discount.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{discount.name}</h3>
                  <p className="text-xs text-gray-600">{discount.description}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${discount.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                  {discount.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mb-3 p-2 bg-white rounded border">
                <p className="text-sm font-bold text-blue-600">
                  {discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}
                </p>
                <p className="text-xs text-gray-600">{getApplicableToLabel(discount.applicable_to)}</p>
              </div>

              <p className="text-xs text-gray-500 mb-3">
                Created: {new Date(discount.created_at).toLocaleDateString()}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(discount.id, discount.is_active)}
                  className={`flex-1 text-sm py-1 rounded transition ${discount.is_active ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                >
                  {discount.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDeleteDiscount(discount.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-1 rounded transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Discount Modal */}
      {showModal && (
        <Modal 
          title="Create New Discount"
          onClose={() => {
            setShowModal(false);
            setFormData({
              name: '',
              description: '',
              type: 'percentage',
              value: '',
              applicable_to: 'all',
              products: [],
              categories: []
            });
          }}
          buttons={[
            { 
              label: 'Create',
              onClick: handleCreateDiscount,
              variant: 'primary'
            },
            { 
              label: 'Cancel',
              onClick: () => setShowModal(false),
              variant: 'secondary'
            }
          ]}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Discount Name *</label>
              <input
                type="text"
                placeholder="e.g., Summer Sale, Vegetable Discount"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Description</label>
              <input
                type="text"
                placeholder="e.g., 20% off on all fresh vegetables"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Value *</label>
                <input
                  type="number"
                  placeholder={formData.type === 'percentage' ? '20' : '100'}
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Applicable To *</label>
              <select
                value={formData.applicable_to}
                onChange={(e) => setFormData({ ...formData, applicable_to: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="all">All Products</option>
                <option value="category">Specific Categories</option>
                <option value="product">Specific Products</option>
              </select>
            </div>

            {formData.applicable_to === 'category' && (
              <div>
                <label className="block text-sm font-semibold mb-1">Select Categories</label>
                <div className="border rounded p-2 max-h-40 overflow-y-auto">
                  {categories.map(cat => (
                    <label key={cat} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(cat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, categories: [...formData.categories, cat] });
                          } else {
                            setFormData({ ...formData, categories: formData.categories.filter(c => c !== cat) });
                          }
                        }}
                        className="mr-2"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {formData.applicable_to === 'product' && (
              <div>
                <label className="block text-sm font-semibold mb-1">Select Products</label>
                <div className="border rounded p-2 max-h-40 overflow-y-auto">
                  {products.map(prod => (
                    <label key={prod.id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={formData.products.includes(prod.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, products: [...formData.products, prod.id] });
                          } else {
                            setFormData({ ...formData, products: formData.products.filter(p => p !== prod.id) });
                          }
                        }}
                        className="mr-2"
                      />
                      {prod.name} (₹{prod.price})
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DiscountManagement;
