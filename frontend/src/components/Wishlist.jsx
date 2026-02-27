import React, { useState, useEffect } from 'react';

const Wishlist = ({ customerId }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (customerId) {
      fetchWishlist();
    }
  }, [customerId]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlist/customer/${customerId}`);
      const data = await response.json();
      setWishlist(data.wishlist || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setMessage('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId, productId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlist/${wishlistId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setWishlist(wishlist.filter(item => item.id !== wishlistId));
        setMessage('Removed from wishlist');
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setMessage('Failed to remove from wishlist');
    }
  };

  const addToCart = (product) => {
    // This would integrate with your cart system
    console.log('Adding to cart:', product);
    setMessage(`${product.name} added to cart!`);
    setTimeout(() => setMessage(''), 2000);
  };

  if (loading) {
    return <div className="p-4">Loading wishlist...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">❤️ My Wishlist</h2>
      
      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
          {message}
        </div>
      )}

      {wishlist.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Your wishlist is empty</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map(item => (
            <div key={item.id} className="border roundedborder-2 border-pink-200 p-4 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-gray-600 text-sm">{item.category}</p>
                </div>
                <button
                  onClick={() => removeFromWishlist(item.id, item.product_id)}
                  className="text-red-500 hover:text-red-700 text-xl"
                  title="Remove from wishlist"
                >
                  ✕
                </button>
              </div>

              <div className="mb-3">
                <p className="text-lg font-bold text-green-600">₹{item.price.toFixed(2)}</p>
                <p className="text-sm text-gray-600">
                  Stock: {item.current_stock} {item.unit}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => addToCart(item)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
                >
                  Add to Cart
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Added: {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center text-sm text-gray-600">
        {wishlist.length > 0 && `You have ${wishlist.length} item(s) in your wishlist`}
      </div>
    </div>
  );
};

export default Wishlist;
