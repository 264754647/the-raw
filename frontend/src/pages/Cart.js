import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Cart({ token, darkMode }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const colors = {
    bg: darkMode ? '#0f0f0f' : '#fff',
    text: darkMode ? '#fff' : '#000',
    textLight: darkMode ? '#999' : '#999',
    border: darkMode ? '#333' : '#f0f0f0',
    imageBg: darkMode ? '#1a1a1a' : '#f9f9f9',
    errorBg: darkMode ? '#331111' : '#ffebee',
    errorText: darkMode ? '#ff6b6b' : '#d32f2f'
  };

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (token) fetchCart();
  }, [token]);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart({ items: res.data });
    } catch (err) {
      console.error('Error loading cart:', err);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await axios.post(`${API_URL}/api/cart/remove`, { productId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
    } catch (err) {
      setError('Failed to remove item');
    }
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      await axios.post(`${API_URL}/api/cart/update`, { productId, quantity }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
    } catch (err) {
      setError('Failed to update quantity');
    }
  };

  if (loading) return <div style={{ padding: '60px 50px', textAlign: 'center', color: colors.text }}>Loading cart...</div>;

  const total = cart?.items?.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0) || 0;

  return (
    <div style={{ padding: '60px 50px', backgroundColor: colors.bg, fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '300', color: colors.text, marginBottom: '40px' }}>SHOPPING BAG</h1>

      {!cart || cart.items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: colors.textLight, marginBottom: '30px' }}>YOUR BAG IS EMPTY</p>
          <Link to="/"><button style={{ padding: '15px 40px', backgroundColor: colors.text, color: colors.bg, border: 'none', cursor: 'pointer' }}>CONTINUE SHOPPING</button></Link>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '60px' }}>
          <div style={{ flex: 1.5 }}>
            {cart.items.map((item) => (
              <div key={item.productId} style={{ display: 'flex', gap: '30px', paddingBottom: '30px', borderBottom: `1px solid ${colors.border}`, marginBottom: '30px' }}>
                
                <div style={{ width: '150px', height: '200px', backgroundColor: colors.imageBg, flexShrink: 0, overflow: 'hidden' }}>
                  <img
                    src={`/products/${item.productId}.jpg`}
                    alt={item.productDetails?.name || 'Product'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      const dbImage = item.productDetails?.image || item.image;
                      if (dbImage && e.target.src !== dbImage) {
                        e.target.src = dbImage;
                      } else {
                        e.target.src = 'https://via.placeholder.com/150x200?text=THE+RAW';
                      }
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '400', color: colors.text, margin: '0 0 15px 0' }}>
                    {item.productDetails?.name || item.name || 'Product'}
                  </h3>
                  <p style={{ fontSize: '13px', color: colors.text, marginBottom: '15px' }}>
                    ${item.price || '0.00'}
                  </p>
                  <div style={{ fontSize: '12px', color: colors.textLight, marginBottom: '20px' }}>
                    {item.size && <div>Size: {item.size}</div>}
                    {item.color && <div>Color: {item.color}</div>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <button onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)} style={{ width: '30px', height: '30px', border: `1px solid ${colors.border}`, background: 'none', color: colors.text, cursor: 'pointer' }}>-</button>
                    <span style={{ width: '20px', textAlign: 'center', color: colors.text }}>{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)} style={{ width: '30px', height: '30px', border: `1px solid ${colors.border}`, background: 'none', color: colors.text, cursor: 'pointer' }}>+</button>
                  </div>

                  <button onClick={() => handleRemoveItem(item.productId)} style={{ background: 'none', border: 'none', color: colors.textLight, cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}>Remove</button>
                </div>

                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  <p style={{ fontSize: '13px', color: colors.text }}>${((item.price || 0) * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div style={{ flex: 1, backgroundColor: colors.imageBg, padding: '30px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '13px', marginBottom: '30px' }}>ORDER SUMMARY</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '13px' }}>
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div style={{ borderBottom: `1px solid ${colors.border}`, marginBottom: '15px' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontWeight: '400' }}>
              <span>TOTAL</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Link to="/checkout"><button style={{ width: '100%', padding: '15px', backgroundColor: colors.text, color: colors.bg, border: 'none', cursor: 'pointer', marginBottom: '10px' }}>PROCEED TO CHECKOUT</button></Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;