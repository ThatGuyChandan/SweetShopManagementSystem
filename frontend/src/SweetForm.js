import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './App';

const SweetForm = ({ sweetToEdit, onSweetSaved }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (sweetToEdit) {
      setName(sweetToEdit.name);
      setCategory(sweetToEdit.category);
      setPrice(sweetToEdit.price);
      setQuantity(sweetToEdit.quantity);
    } else {
      setName('');
      setCategory('');
      setPrice('');
      setQuantity('');
    }
  }, [sweetToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const method = sweetToEdit ? 'PUT' : 'POST';
    const url = sweetToEdit ? `/api/sweets/${sweetToEdit._id}` : '/api/sweets';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ name, category, price, quantity }),
      });

      const data = await response.json();

      if (response.ok) {
        onSweetSaved();
      } else {
        setMessage(data.msg || 'An error occurred');
      }
    } catch (error) {
      setMessage('Network error');
      console.error('Sweet form error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="sweet-form">
      <div className="form-grid">
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Category:</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Price:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Quantity:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary">{sweetToEdit ? 'Update Sweet' : 'Add Sweet'}</button>
      </div>
      {message && <p className="message error">{message}</p>}
    </form>
  );
};

export default SweetForm;