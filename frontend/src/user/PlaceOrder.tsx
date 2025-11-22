import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { CartItem } from '../types';

export default function PlaceOrder() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Get cart items from localStorage
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error('Error parsing cart:', err);
      }
    }
  }, []);

  const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  async function handleMakePayment() {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (!deliveryAddress.trim()) {
      alert('Please enter a delivery address');
      return;
    }

    if (!phone.trim()) {
      alert('Please enter a phone number');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Please login to place an order');
        navigate('/');
        return;
      }

      // Create order with items
      const orderData = {
        items: cartItems.map(item => ({
          pizza_id: item.pizza.pizza_id || item.pizza.id,
          size: item.size,
          crust: item.crust,
          quantity: 1,
          unit_price: item.totalPrice,
          toppings: item.selectedToppings.map(t => t.topping_id || t.id)
        })),
        address_text: deliveryAddress,
        phone: phone,
        total_amount: total
      };

      const response = await api.post('/orders', orderData);
      
      alert(`Order placed successfully! Order ID: ${response.id}\nTotal: Rs. ${total.toFixed(2)}`);
      // Clear cart
      localStorage.removeItem('cartItems');
      // Redirect to home
      window.close();
      navigate('/');
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function removeFromCart(itemId: number) {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: "url('https://static.vecteezy.com/system/resources/previews/004/671/718/non_2x/pizza-icons-seamless-pattern-free-vector.jpg')",
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #7d8192ff 0%, #0e0e0eff 100%)',
          padding: '32px 40px',
          color: '#fff'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 'bold',
            marginBottom: 8
          }}>Place Your Order</h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: 16 }}>
            Review your items and complete your purchase
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '40px' }}>
          {cartItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: '#999'
            }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>🛒</div>
              <h2 style={{ color: '#666', marginBottom: 12 }}>Your cart is empty</h2>
              <p style={{ marginBottom: 24 }}>Add some delicious pizzas to get started!</p>
              <button
                onClick={() => window.close()}
                style={{
                  padding: '12px 32px',
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#fff',
                  background: '#667eea',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#5568d3'}
                onMouseLeave={e => e.currentTarget.style.background = '#667eea'}
              >
                Back to Home
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div style={{ marginBottom: 32 }}>
                <h2 style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  marginBottom: 20,
                  color: '#333',
                  borderBottom: '2px solid #f0f0f0',
                  paddingBottom: 12
                }}>
                  Order Summary ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: '#f8f9fa',
                        borderRadius: 12,
                        padding: 20,
                        border: '1px solid #e0e0e0',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: 12
                      }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            margin: '0 0 8px 0',
                            fontSize: 18,
                            color: '#333',
                            fontWeight: 'bold'
                          }}>
                            {item.pizza.name}
                          </h3>
                          <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                            <strong>Size:</strong> {item.size} | <strong>Crust:</strong> {item.crust}
                          </div>
                          {item.selectedToppings.length > 0 && (
                            <div style={{ fontSize: 13, color: '#666' }}>
                              <strong>Toppings:</strong> {item.selectedToppings.map(t => t.name).join(', ')}
                            </div>
                          )}
                        </div>
                        <div style={{
                          fontSize: 20,
                          fontWeight: 'bold',
                          color: '#667eea',
                          marginLeft: 16
                        }}>
                          Rs. {item.totalPrice.toFixed(2)}
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          padding: '8px 16px',
                          fontSize: 13,
                          fontWeight: '600',
                          color: '#d32f2f',
                          background: '#fff',
                          border: '1px solid #d32f2f',
                          borderRadius: 6,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#ffebee'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                      >
                        Remove Item
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details */}
              <div style={{ marginBottom: 32 }}>
                <h2 style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  marginBottom: 20,
                  color: '#333',
                  borderBottom: '2px solid #f0f0f0',
                  paddingBottom: 12
                }}>
                  Delivery Details
                </h2>
                
                <div style={{ marginBottom: 20 }}>
                  <label style={{
                    display: 'block',
                    fontWeight: '600',
                    marginBottom: 8,
                    color: '#333',
                    fontSize: 14
                  }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: 15,
                      border: '2px solid #e0e0e0',
                      borderRadius: 8,
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = '#667eea'}
                    onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontWeight: '600',
                    marginBottom: 8,
                    color: '#333',
                    fontSize: 14
                  }}>
                    Delivery Address *
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your complete delivery address"
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: 15,
                      border: '2px solid #e0e0e0',
                      borderRadius: 8,
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = '#667eea'}
                    onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
                  />
                </div>
              </div>

              {/* Order Total */}
              <div style={{
                background: 'linear-gradient(135deg, #7d8192ff 0%, #0e0e0eff 100%)',
                borderRadius: 12,
                padding: 24,
                marginBottom: 24
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20
                }}>
                  <span style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: '#fff'
                  }}>Order Total:</span>
                  <span style={{
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: '#fff'
                  }}>
                    Rs. {total.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleMakePayment}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#2d2e32ff',
                    background: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    opacity: loading ? 0.7 : 1
                  }}
                  onMouseEnter={e => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                    }
                  }}
                >
                  {loading ? 'Processing...' : '💳 Make Payment'}
                </button>
              </div>

              {/* Back Button */}
              <button
                onClick={() => window.close()}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  fontSize: 15,
                  fontWeight: '600',
                  color: '#666',
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#e0e0e0'}
                onMouseLeave={e => e.currentTarget.style.background = '#f0f0f0'}
              >
                ← Back to Shopping
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
