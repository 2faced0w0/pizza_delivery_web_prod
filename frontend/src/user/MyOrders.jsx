import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useNavigate } from 'react-router-dom';

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Please login to view your orders');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:4000/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusColor(status) {
    const colors = {
      'pending': '#ff9800',
      'confirmed': '#2196f3',
      'preparing': '#9c27b0',
      'out_for_delivery': '#ff5722',
      'delivered': '#4caf50',
      'cancelled': '#f44336'
    };
    return colors[status] || '#666';
  }

  function getStatusLabel(status) {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 0,
        maxWidth: 1200,
        margin: '0 auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '2px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8f9fa'
        }}>
          <h1 style={{ margin: 0, fontSize: 28, color: '#333', fontWeight: '600' }}>
            My Orders
          </h1>
          <button 
            onClick={() => navigate('/')}
            style={{
              padding: '10px 24px',
              fontSize: 16,
              fontWeight: '500',
              color: '#fff',
              background: '#1976d2',
              border: '2px solid #1976d2',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.target.style.background = '#1565c0';
              e.target.style.borderColor = '#1565c0';
            }}
            onMouseLeave={e => {
              e.target.style.background = '#1976d2';
              e.target.style.borderColor = '#1976d2';
            }}
          >
            ← Back to Home
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '24px 32px',
          minHeight: '400px'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              <p style={{ fontSize: 18, margin: 0 }}>Loading your orders...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#d32f2f' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
              <p style={{ fontSize: 18, margin: 0 }}>{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
              <p style={{ fontSize: 20, margin: 0, fontWeight: '500' }}>No orders yet</p>
              <p style={{ fontSize: 14, marginTop: 8, color: '#666' }}>
                Order some delicious pizzas to see them here!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {orders.map(order => (
                <div
                  key={order.id}
                  style={{
                    background: '#f8f9fa',
                    borderRadius: 8,
                    padding: 20,
                    border: '1px solid #ddd',
                    transition: 'box-shadow 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Order Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: 16,
                    paddingBottom: 16,
                    borderBottom: '1px solid #ddd'
                  }}>
                    <div>
                      <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                        Order #{order.id}
                      </div>
                      <div style={{ fontSize: 13, color: '#999' }}>
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16
                    }}>
                      <span style={{
                        padding: '6px 16px',
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: '600',
                        color: '#fff',
                        background: getStatusColor(order.status)
                      }}>
                        {getStatusLabel(order.status)}
                      </span>
                      <div style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: '#1976d2'
                      }}>
                        Rs. {Number(order.total_amount).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ 
                        fontSize: 13, 
                        fontWeight: '600', 
                        color: '#666',
                        marginBottom: 12,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Items
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: '#fff',
                              padding: 12,
                              borderRadius: 6,
                              border: '1px solid #e0e0e0'
                            }}
                          >
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'start'
                            }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ 
                                  fontSize: 15, 
                                  fontWeight: '600',
                                  color: '#333',
                                  marginBottom: 6
                                }}>
                                  {item.pizza_name}
                                  {item.quantity > 1 && (
                                    <span style={{ 
                                      color: '#666', 
                                      fontWeight: 'normal',
                                      marginLeft: 8
                                    }}>
                                      × {item.quantity}
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: 13, color: '#666' }}>
                                  <span style={{ fontWeight: '500' }}>Size:</span> {item.size}
                                  {item.crust && (
                                    <span style={{ marginLeft: 12 }}>
                                      <span style={{ fontWeight: '500' }}>Crust:</span> {item.crust}
                                    </span>
                                  )}
                                </div>
                                {item.toppings && item.toppings.length > 0 && (
                                  <div style={{ 
                                    fontSize: 12, 
                                    color: '#666',
                                    marginTop: 4
                                  }}>
                                    <span style={{ fontWeight: '500' }}>Toppings:</span> {item.toppings.join(', ')}
                                  </div>
                                )}
                              </div>
                              <div style={{
                                fontSize: 15,
                                fontWeight: '600',
                                color: '#333',
                                marginLeft: 16
                              }}>
                                Rs. {Number(item.unit_price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delivery Address */}
                  {order.address_text && (
                    <div style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: '1px solid #ddd'
                    }}>
                      <div style={{ 
                        fontSize: 13, 
                        fontWeight: '600', 
                        color: '#666',
                        marginBottom: 6
                      }}>
                        Delivery Address
                      </div>
                      <div style={{ fontSize: 14, color: '#333' }}>
                        {order.address_text}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
