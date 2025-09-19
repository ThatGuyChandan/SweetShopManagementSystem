import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from './App'; // Assuming AuthContext is exported from App.js

const SweetList = () => {
  const [sweets, setSweets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [message, setMessage] = useState('');
  const { token } = useContext(AuthContext);

  const fetchSweets = useCallback(async () => {
    try {
      let url = '/api/sweets';
      const params = new URLSearchParams();

      if (searchQuery) params.append('name', searchQuery);
      if (categoryFilter) params.append('category', categoryFilter);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);

      if (params.toString()) {
        url = `/api/sweets/search?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setSweets(data);
      } else {
        setMessage(data.msg || 'Failed to fetch sweets');
      }
    } catch (error) {
      setMessage('Network error');
      console.error('Fetch sweets error:', error);
    }
  }, [token, searchQuery, categoryFilter, minPrice, maxPrice]);

  useEffect(() => {
    if (token) {
      fetchSweets();
    }
  }, [token, fetchSweets]);

  const handlePurchase = async (sweetId) => {
    try {
      const response = await fetch(`/api/sweets/${sweetId}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ quantity: 1 }), // Purchase one at a time
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(`Purchased ${data.name}!`);
        fetchSweets(); // Refresh the list
      } else {
        setMessage(data.msg || 'Failed to purchase sweet');
      }
    } catch (error) {
      setMessage('Network error');
      console.error('Purchase error:', error);
    }
  };

  return (
    <div className="sweet-list-container">
      <h2>Available Sweets</h2>
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <button onClick={fetchSweets}>Apply Filters</button>
      </div>
      {message && <p className="message">{message}</p>}
      <div className="sweets-grid">
        {sweets.length > 0 ? (
          sweets.map((sweet) => (
            <div key={sweet._id} className="sweet-card">
              <h3>{sweet.name}</h3>
              <p>Category: {sweet.category}</p>
              <p>Price: ${sweet.price}</p>
              <p>Quantity: {sweet.quantity}</p>
              <button
                onClick={() => handlePurchase(sweet._id)}
                disabled={sweet.quantity === 0}
              >
                {sweet.quantity === 0 ? 'Out of Stock' : 'Purchase'}
              </button>
            </div>
          ))
        ) : (
          <p>No sweets available.</p>
        )}
      </div>
    </div>
  );
};

export default SweetList;
