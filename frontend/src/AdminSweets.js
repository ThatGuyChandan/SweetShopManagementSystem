import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from './App';
import SweetForm from './SweetForm';

const AdminSweets = () => {
  const [sweets, setSweets] = useState([]);
  const [message, setMessage] = useState('');
  const [sweetToEdit, setSweetToEdit] = useState(null);
  const { token } = useContext(AuthContext);

  const fetchSweets = useCallback(async () => {
    try {
      const response = await fetch('/api/sweets', {
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
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchSweets();
    }
  }, [token, fetchSweets]);

  const handleDelete = async (sweetId) => {
    if (window.confirm('Are you sure you want to delete this sweet?')) {
      try {
        const response = await fetch(`/api/sweets/${sweetId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': token,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setMessage(data.msg);
          fetchSweets();
        } else {
          setMessage(data.msg || 'Failed to delete sweet');
        }
      } catch (error) {
        setMessage('Network error');
        console.error('Delete sweet error:', error);
      }
    }
  };

  const handleRestock = async (sweetId) => {
    const restockQuantity = parseInt(prompt('Enter quantity to restock:', 10));
    if (restockQuantity && restockQuantity > 0) {
      try {
        const response = await fetch(`/api/sweets/${sweetId}/restock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({ quantity: restockQuantity }),
        });
        const data = await response.json();
        if (response.ok) {
          setMessage(`Restocked ${data.name} by ${restockQuantity}`);
          fetchSweets();
        } else {
          setMessage(data.msg || 'Failed to restock sweet');
        }
      } catch (error) {
        setMessage('Network error');
        console.error('Restock error:', error);
      }
    }
  };

  return (
    <div className="admin-sweets-container">
      <h2>Manage Sweets (Admin)</h2>
      {message && <p className="message">{message}</p>}

      <SweetForm sweetToEdit={sweetToEdit} onSweetSaved={() => { fetchSweets(); setSweetToEdit(null); }} />

      <h3>Current Sweets</h3>
      <div className="sweets-grid">
        {sweets.length > 0 ? (
          sweets.map((sweet) => (
            <div key={sweet._id} className="sweet-card">
              <h3>{sweet.name}</h3>
              <p>Category: {sweet.category}</p>
              <p>Price: ${sweet.price}</p>
              <p>Quantity: {sweet.quantity}</p>
              <button onClick={() => setSweetToEdit(sweet)}>Edit</button>
              <button onClick={() => handleDelete(sweet._id)}>Delete</button>
              <button onClick={() => handleRestock(sweet._id)}>Restock</button>
            </div>
          ))
        ) : (
          <p>No sweets available.</p>
        )}
      </div>
    </div>
  );
};

export default AdminSweets;
