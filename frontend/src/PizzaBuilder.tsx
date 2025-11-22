import { useEffect, useState } from 'react';
import { api } from './api';
import AuthPage from './AuthPage';
import { Pizza, Topping, CartItem, User } from './types';

const CRUST_TYPES = ['Thin crust', 'Fresh pan', 'Hand tossed', 'Cheese Burst'] as const;
const SIZE_OPTIONS = ['Small', 'Medium', 'Large'] as const;

type SizeOption = typeof SIZE_OPTIONS[number];

export default function PizzaBuilder() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [selectedPizza, setSelectedPizza] = useState<Pizza | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [selectedCrust, setSelectedCrust] = useState<string>('Thin crust');
  const [size, setSize] = useState<SizeOption>('Medium');
  const [quantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [showCustomization, setShowCustomization] = useState<boolean>(false);
  const [customizingPizza, setCustomizingPizza] = useState<Pizza | null>(null);
  const [showCart, setShowCart] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([api.get('/pizzas'), api.get('/toppings')])
      .then(([p, t]) => {
        if (!mounted) return;
        setPizzas(p);
        setToppings(t);
        if (p && p.length) setSelectedPizza(p[0]);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // Decode JWT to get user role
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ token, role: payload.role, id: payload.id });
      } catch (err) {
        console.error('Error decoding token:', err);
        setUser({ token });
      }
    }
  }, []);

  function toggleTopping(topping: Topping): void {
    setSelectedToppings(prev => {
      const toppingId = topping.topping_id || topping.id;
      if (prev.find(x => (x.topping_id || x.id) === toppingId)) return prev.filter(x => (x.topping_id || x.id) !== toppingId);
      return [...prev, topping];
    });
  }

  function openCustomization(pizza: Pizza): void {
    setCustomizingPizza(pizza);
    setSelectedPizza(pizza);
    setSelectedToppings([]);
    setSize('Medium');
    setShowCustomization(true);
  }

  function openEditCustomization(cartItem: CartItem): void {
    setCustomizingPizza(cartItem.pizza);
    setSelectedPizza(cartItem.pizza);
    setSelectedToppings(cartItem.selectedToppings);
    setSelectedCrust(cartItem.crust);
    setSize(cartItem.size as SizeOption);
    setEditingCartItem(cartItem);
    setShowCart(false);
    setShowCustomization(true);
  }

  function handleAddToCart(): void {
    if (!customizingPizza) return;
    // const pizzaId = customizingPizza.pizza_id || customizingPizza.id;
    
    const cartItem: CartItem = {
      id: editingCartItem ? editingCartItem.id : Date.now(),
      pizza: customizingPizza,
      crust: selectedCrust,
      size,
      selectedToppings: [...selectedToppings],
      totalPrice: parseFloat(totalPrice)
    };

    if (editingCartItem) {
      // Update existing item
      setCartItems(prev => prev.map(item => 
        item.id === editingCartItem.id ? cartItem : item
      ));
      setEditingCartItem(null);
    } else {
      // Add new item
      setCartItems(prev => [...prev, cartItem]);
    }

    setShowCustomization(false);
    setCustomizingPizza(null);
    setSelectedToppings([]);
    setSize('Medium');
  }

  function removeFromCart(itemId: number): void {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  }

  function handlePlaceOrder(): void {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    // Save cart to localStorage and open Place Order page in new tab
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    window.open('/place-order', '_blank');
    setShowCart(false);
  }

  function calcUnitPrice(): number {
    const pizza = customizingPizza || selectedPizza;
    if (!pizza) return 0;
    let basePrice = 0;
    if (size === 'Small') basePrice = Number(pizza.price_regular || 0);
    else if (size === 'Medium') basePrice = Number(pizza.price_medium || 0);
    else if (size === 'Large') basePrice = Number(pizza.price_large || 0);
    const toppingsTotal = selectedToppings.reduce((s, t) => s + Number(t.price || 0), 0);
    return basePrice + toppingsTotal;
  }

  const unitPrice = calcUnitPrice();
  const totalPrice = (unitPrice * Math.max(1, Number(quantity))).toFixed(2);

  // Categorize pizzas from DB category field
  const vegPizzas = pizzas.filter(p => p.category === 'Veg');
  const nonVegPizzas = pizzas.filter(p => p.category === 'Non-Veg');

  if (loading) return <div style={{ padding: 20 }}>Loading builder...</div>;

  return (
    <div>
      
      {showAuth && <AuthPage onClose={() => setShowAuth(false)} onAuthSuccess={(data: User) => setUser(data)} />}
      
      {/* Cart Summary Sidebar */}
      {showCart && (
        <>
          {/* Overlay */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 2000,
              transition: 'opacity 0.3s ease'
            }}
            onClick={() => setShowCart(false)}
          />
          
          {/* Sidebar */}
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '450px',
            maxWidth: '90vw',
            background: '#fff',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.2)',
            zIndex: 2001,
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideInRight 0.3s ease'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '2px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8f9fa'
            }}>
              <h2 style={{ margin: 0, fontSize: 24, color: '#333' }}>
                Cart Summary ({cartItems.length})
              </h2>
              <button
                onClick={() => setShowCart(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 32,
                  cursor: 'pointer',
                  color: '#666',
                  padding: 0,
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >×</button>
            </div>

            {/* Cart Items List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px'
            }}>
              {cartItems.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#999'
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
                  <p style={{ fontSize: 18, margin: 0 }}>Your cart is empty</p>
                  <p style={{ fontSize: 14, marginTop: 8 }}>Add some delicious pizzas!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: '#f8f9fa',
                        borderRadius: 8,
                        padding: 16,
                        border: '1px solid #ddd'
                      }}
                    >
                      {/* Item Header */}
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
                          fontSize: 18,
                          fontWeight: 'bold',
                          color: '#1976d2',
                          marginLeft: 12
                        }}>
                          Rs. {item.totalPrice.toFixed(2)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{
                        display: 'flex',
                        gap: 8,
                        marginTop: 12
                      }}>
                        <button
                          onClick={() => openEditCustomization(item)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            fontSize: 13,
                            fontWeight: '600',
                            color: '#1976d2',
                            background: '#fff',
                            border: '1px solid #1976d2',
                            borderRadius: 6,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#e3f2fd';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = '#fff';
                          }}
                        >
                          Customize
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            fontSize: 13,
                            fontWeight: '600',
                            color: '#d32f2f',
                            background: '#fff',
                            border: '1px solid #d32f2f',
                            borderRadius: 6,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#ffebee';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = '#fff';
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with Total and Payment Button */}
            {cartItems.length > 0 && (
              <div style={{
                borderTop: '2px solid #eee',
                padding: '20px 24px',
                background: '#f8f9fa'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                  fontSize: 20,
                  fontWeight: 'bold'
                }}>
                  <span style={{ color: '#333' }}>Order Total:</span>
                  <span style={{ color: '#1976d2', fontSize: 24 }}>
                    Rs. {cartItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#fff',
                    background: '#4caf50',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(76,175,80,0.3)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#45a049';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(76,175,80,0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#4caf50';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(76,175,80,0.3)';
                  }}
                >
                  Make Payment
                </button>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Customization Modal */}
      {showCustomization && customizingPizza && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: 20
        }} onClick={() => setShowCustomization(false)}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 32,
            maxWidth: 600,
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowCustomization(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'transparent',
                border: 'none',
                fontSize: 28,
                cursor: 'pointer',
                color: '#666',
                padding: 0,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >×</button>

            <h2 style={{ marginTop: 0, marginBottom: 24, color: '#333', fontSize: 24 }}>
              Customize Your {customizingPizza.name}
            </h2>

            {/* Size Selection */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 12, fontSize: 16 }}>
                Select Size:
              </label>
              <div style={{ display: 'flex', gap: 12 }}>
                {SIZE_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      fontSize: 15,
                      fontWeight: size === s ? 'bold' : 'normal',
                      color: size === s ? '#fff' : '#333',
                      background: size === s ? '#1976d2' : '#f5f5f5',
                      border: size === s ? '2px solid #1565c0' : '2px solid #ddd',
                      borderRadius: 6,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Toppings Selection */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 12, fontSize: 16 }}>
                Add Toppings:
              </label>
              <div style={{ 
                maxHeight: 300, 
                overflow: 'auto', 
                border: '1px solid #ddd', 
                borderRadius: 6,
                padding: 12
              }}>
                {toppings.map(topping => {
                  const toppingId = topping.topping_id || topping.id;
                  const isSelected = selectedToppings.find(t => (t.topping_id || t.id) === toppingId);
                  return (
                    <label
                      key={toppingId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 12px',
                        cursor: 'pointer',
                        borderRadius: 4,
                        marginBottom: 8,
                        background: isSelected ? '#e3f2fd' : 'transparent',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) e.currentTarget.style.background = '#f5f5f5';
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={() => toggleTopping(topping)}
                        style={{
                          width: 18,
                          height: 18,
                          marginRight: 12,
                          cursor: 'pointer'
                        }}
                      />
                      <span style={{ flex: 1, fontSize: 15 }}>{topping.name}</span>
                      <span style={{ fontWeight: 'bold', color: '#1976d2', fontSize: 15 }}>
                        +Rs. {Number(topping.price || 0).toFixed(2)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Summary */}
            <div style={{ 
              background: '#f5f5f5', 
              padding: 16, 
              borderRadius: 6,
              marginBottom: 24
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 15 }}>Base Price ({size}):</span>
                <span style={{ fontWeight: 'bold', fontSize: 15 }}>
                  Rs. {(() => {
                    if (size === 'Small') return Number(customizingPizza.price_regular || 0).toFixed(2);
                    if (size === 'Medium') return Number(customizingPizza.price_medium || 0).toFixed(2);
                    if (size === 'Large') return Number(customizingPizza.price_large || 0).toFixed(2);
                  })()}
                </span>
              </div>
              {selectedToppings.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 15 }}>Toppings ({selectedToppings.length}):</span>
                  <span style={{ fontWeight: 'bold', fontSize: 15 }}>
                    +Rs. {selectedToppings.reduce((s, t) => s + Number(t.price || 0), 0).toFixed(2)}
                  </span>
                </div>
              )}
              <div style={{ 
                borderTop: '2px solid #ddd', 
                paddingTop: 8, 
                marginTop: 8,
                display: 'flex', 
                justifyContent: 'space-between' 
              }}>
                <span style={{ fontSize: 17, fontWeight: 'bold' }}>Total:</span>
                <span style={{ fontSize: 17, fontWeight: 'bold', color: '#1976d2' }}>
                  Rs. {totalPrice}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: 16,
                fontWeight: 'bold',
                color: '#fff',
                background: '#e43232e9',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(175, 76, 79, 0.4)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#8b1713ff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(175, 76, 79, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#e43232e9';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(175, 76, 79, 0.4)';
              }}
            >
              <img 
                src="https://thumbs.dreamstime.com/b/shopping-cart-icon-red-background-flat-style-vector-illustration-179113408.jpg"
                alt="Cart"
                style={{ width: 24, height: 24, objectFit: 'contain' }}
              />
              Add to Cart
            </button>
          </div>
        </div>
      )}
      
      {/* Header with Auth Buttons */}
      <div style={{ 
        position: 'static', 
        top: 0, 
        zIndex: 1000, 
        background: '#ffffff04', 
        borderBottom: '1px solid #eee',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 12
      }}>
        <div>
          <p style={{textAlign: 'center', 
          margin: 0, 
          fontFamily: 'sans-serif',
          fontWeight: '600',
          fontSize: 24,
          color: '#fff',
          padding: 20
          }}>Pizza Builder</p>
        </div>
        
        {user ? (
          <>
            <button
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
                e.currentTarget.style.background = '#1565c0';
                e.currentTarget.style.borderColor = '#1565c0';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#1976d2';
                e.currentTarget.style.borderColor = '#1976d2';
              }}
              onClick={() => window.open(user.role === 'admin' ? '/admin' : '/my-orders', '_blank')}
            >
              {user.role === 'admin' ? 'My Store' : 'My Orders'}
            </button>
            <button
              style={{
                padding: '10px 24px',
                fontSize: 16,
                fontWeight: '500',
                color: '#fff',
                background: '#d32f2f',
                border: '2px solid #d32f2f',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#b71c1c';
                e.currentTarget.style.borderColor = '#b71c1c';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#d32f2f';
                e.currentTarget.style.borderColor = '#d32f2f';
              }}
              onClick={() => {
                localStorage.removeItem('authToken');
                setUser(null);
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              style={{
                padding: '10px 24px',
                fontSize: 16,
                fontWeight: '500',
                color: '#1976d2',
                background: '#fff',
                border: '2px solid #1976d2',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#1976d2';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.color = '#1976d2';
              }}
              onClick={() => setShowAuth(true)}
            >
              Login
            </button>
            <button
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
                e.currentTarget.style.background = '#1565c0';
                e.currentTarget.style.borderColor = '#1565c0';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#1976d2';
                e.currentTarget.style.borderColor = '#1976d2';
              }}
              onClick={() => setShowAuth(true)}
            >
              Sign Up
            </button>
          </>
        )}
      </div>

      {/* Crust Selection Card */}
      <div style={{  
        padding: 30, 
        background: '#d4a674f4', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#333', fontSize: 28 }}>Choose your base</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: 16, 
          justifyContent: 'center' 
        }}>
          {CRUST_TYPES.map(crust => {
            const isSelected = selectedCrust === crust;
            return (
              <button
                key={crust}
                onClick={() => setSelectedCrust(crust)}
                style={{
                  padding: '16px 20px',
                  fontSize: 16,
                  fontWeight: isSelected ? 'bold' : 'normal',
                  color: isSelected ? '#fff' : '#333',
                  background: isSelected ? '#8B4513' : '#fff',
                  border: isSelected ? '3px solid #5D2E0C' : '2px solid #ccc',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = '#cb780a6c';
                    e.currentTarget.style.borderColor = '#999';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.borderColor = '#ccc';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {crust}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pizza Selection Table */}
      <div style={{ 
        padding: 30, 
        background: '#fffacdf1', 
        marginTop: 0 
      }}>
        <h2 style={{ textAlign: 'center', 
          marginBottom: 24, 
          color: '#333', 
          fontSize: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12
          }}>
            <p style={{ margin: 0 , alignSelf: 'center'}}>Choose Your Pizza</p>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCart(true);
              }}
              style={{
                padding: '8px',
                fontSize: 14,
                fontWeight: 'bold',
                color: '#030000ff',
                background: '#ffffff',
                border: '2 px solid #fff',
                borderRadius: 6,
                cursor: 'pointer',
                position: 'relative'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.96)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#ffffff04';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <label htmlFor="cart-button">My Cart </label>
              <img 
                src="https://thumbs.dreamstime.com/b/shopping-cart-icon-red-background-flat-style-vector-illustration-179113408.jpg"
                alt="Cart"
                style={{ width: 20, height: 20, objectFit: 'scale-down', marginLeft: 4 , verticalAlign: 'middle'}}
              />
              {cartItems.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  background: '#d32f2f',
                  color: '#0f0000ff',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 'bold',
                  border: '2px solid #000000ff'
                }}>
                  {cartItems.length}
                </span>
              )}
            </button>
            </h2>

        <table style={{ 
          width: '100%', 
          maxWidth: 1200, 
          margin: '0 auto',
          borderCollapse: 'collapse',
          border: '1 px solid #ffffff01'
        }}>
          <thead>
            <tr>
              <th style={{ 
                padding: 16, 
                background: '#90EE90',  
                fontSize: 20, 
                fontWeight: 'bold',
                textAlign: 'center'
              }}>Veg</th>
              <th style={{ 
                padding: 16, 
                background: '#FFB6C1', 
                fontSize: 20, 
                fontWeight: 'bold',
                textAlign: 'center'
              }}>Non-Veg</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '2px solid #fff', padding: 16, verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {vegPizzas.map(pizza => {
                    const pizzaId = pizza.pizza_id || pizza.id;
                    const selectedId = selectedPizza?.pizza_id || selectedPizza?.id;
                    return (
                    <div 
                      key={pizzaId} 
                      onClick={() => { setSelectedPizza(pizza); setSelectedToppings([]); }}
                      style={{ 
                        textAlign: 'center', 
                        padding: 12, 
                        background: selectedId === pizzaId ? '#90EE90' : '#fff',
                        borderRadius: 8,
                        cursor: 'pointer',
                        border: selectedId === pizzaId ? '2px solid #228B22' : '1px solid #ddd',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => {
                        if (selectedId !== pizzaId) {
                          e.currentTarget.style.background = '#E8F5E9';
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (selectedId !== pizzaId) {
                          e.currentTarget.style.background = '#fff';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      <div style={{ 
                        width: 120, 
                        height: 120, 
                        margin: '0 auto 12px', 
                        background: pizza.img_url ? `url(${pizza.img_url})` : '#f0f0f0',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '50%',
                        border: '2px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        color: '#999'
                      }}>
                        {!pizza.img_url && '🍕'}
                      </div>
                      <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{pizza.name}</div>
                      {pizza.description && (
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{pizza.description}</div>
                      )}
                      <div style={{ fontSize: 14, color: '#333' }}>
                        <div>Small: Rs. {Number(pizza.price_regular || 0).toFixed(2)}</div>
                        <div>Medium: Rs. {Number(pizza.price_medium || 0).toFixed(2)}</div>
                        <div>Large: Rs. {Number(pizza.price_large || 0).toFixed(2)}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openCustomization(pizza);
                        }}
                        style={{
                          marginTop: 12,
                          padding: '8px 16px',
                          fontSize: 14,
                          fontWeight: 'bold',
                          color: '#fff',
                          background: '#21d04ac4',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          margin: '12px auto 0',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#1aa34a';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#21d04ac4';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <img 
                          src="https://thumbs.dreamstime.com/b/shopping-cart-icon-red-background-flat-style-vector-illustration-179113408.jpg"
                          alt="Cart"
                          style={{ width: 20, height: 20, objectFit: 'contain' }}
                        />
                        Customize
                      </button>
                    </div>
                  )})}
                </div>
              </td>
              <td style={{ border: '2px solid #fff', padding: 16, verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {nonVegPizzas.map(pizza => {
                    const pizzaId = pizza.pizza_id || pizza.id;
                    const selectedId = selectedPizza?.pizza_id || selectedPizza?.id;
                    return (
                    <div 
                      key={pizzaId} 
                      onClick={() => { setSelectedPizza(pizza); setSelectedToppings([]); }}
                      style={{ 
                        textAlign: 'center', 
                        padding: 12, 
                        background: selectedId === pizzaId ? '#FFB6C1' : '#fff',
                        borderRadius: 8,
                        cursor: 'pointer',
                        border: selectedId === pizzaId ? '2px solid #DC143C' : '1px solid #ddd',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => {
                        if (selectedId !== pizzaId) {
                          e.currentTarget.style.background = '#FFE4E1';
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (selectedId !== pizzaId) {
                          e.currentTarget.style.background = '#fff';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      <div style={{ 
                        width: 120, 
                        height: 120, 
                        margin: '0 auto 12px', 
                        background: pizza.img_url ? `url(${pizza.img_url})` : '#f0f0f0',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '50%',
                        border: '2px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        color: '#999'
                      }}>
                        {!pizza.img_url && '🍕'}
                      </div>
                      <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{pizza.name}</div>
                      {pizza.description && (
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{pizza.description}</div>
                      )}
                      <div style={{ fontSize: 14, color: '#333' }}>
                        <div>Small: Rs. {Number(pizza.price_regular || 0).toFixed(2)}</div>
                        <div>Medium: Rs. {Number(pizza.price_medium || 0).toFixed(2)}</div>
                        <div>Large: Rs. {Number(pizza.price_large || 0).toFixed(2)}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openCustomization(pizza);
                        }}
                        style={{
                          marginTop: 12,
                          padding: '8px 16px',
                          fontSize: 14,
                          fontWeight: 'bold',
                          color: '#fff',
                          background: '#f53412ff',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          margin: '12px auto 0',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#c31a0fff';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#f53412ff';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <img 
                          src="https://thumbs.dreamstime.com/b/shopping-cart-icon-red-background-flat-style-vector-illustration-179113408.jpg"
                          alt="Cart"
                          style={{ width: 20, height: 20, objectFit: 'contain' }}
                        />
                        Customize
                      </button>
                    </div>
                  )})}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>


      
      <div>

      </div>
    </div>
  );
}
