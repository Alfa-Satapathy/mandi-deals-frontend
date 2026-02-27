import React from 'react';
import Wishlist from '../components/Wishlist';

const WishlistPage = () => {
  // Get customer ID from localStorage or props
  const customerId = localStorage.getItem('customerId');

  if (!customerId) {
    return (
      <div className="p-8 text-center">
        <p className="text-xl text-red-600">Please log in to view your wishlist</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Wishlist customerId={customerId} />
    </div>
  );
};

export default WishlistPage;
