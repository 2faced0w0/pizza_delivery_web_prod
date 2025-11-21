import React, { useEffect, useState } from 'react';
import { api } from './api.js';
import AuthPage from './AuthPage.jsx';

const CRUST_TYPES = ['Thin crust', 'Fresh pan', 'Hand tossed', 'Cheese Burst'];
const SIZE_OPTIONS = ['Small', 'Medium', 'Large'];

export default function PizzaBuilder() {
  const [pizzas, setPizzas] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [selectedPizza, setSelectedPizza] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [selectedCrust, setSelectedCrust] = useState('Thin crust');
  const [size, setSize] = useState('Medium');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);

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
      // You can decode JWT or fetch user info here
      setUser({ token });
    }
  }, []);

  function toggleTopping(topping) {
    setSelectedToppings(prev => {
      const toppingId = topping.topping_id || topping.id;
      if (prev.find(x => (x.topping_id || x.id) === toppingId)) return prev.filter(x => (x.topping_id || x.id) !== toppingId);
      return [...prev, topping];
    });
  }

  function calcUnitPrice() {
    if (!selectedPizza) return 0;
    let basePrice = 0;
    if (size === 'Small') basePrice = Number(selectedPizza.price_regular || 0);
    else if (size === 'Medium') basePrice = Number(selectedPizza.price_medium || 0);
    else if (size === 'Large') basePrice = Number(selectedPizza.price_large || 0);
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
    <div style={{ fontFamily: 'sans-serif', background: '#fff', minHeight: '100vh' }}>
      {showAuth && <AuthPage onClose={() => setShowAuth(false)} onAuthSuccess={(data) => setUser(data)} />}
      
      {/* Header with Auth Buttons */}
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000, 
        background: '#fff', 
        borderBottom: '1px solid #eee',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 12
      }}>
        {user ? (
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
              e.target.style.background = '#b71c1c';
              e.target.style.borderColor = '#b71c1c';
            }}
            onMouseLeave={e => {
              e.target.style.background = '#d32f2f';
              e.target.style.borderColor = '#d32f2f';
            }}
            onClick={() => {
              localStorage.removeItem('authToken');
              setUser(null);
            }}
          >
            Logout
          </button>
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
                e.target.style.background = '#1976d2';
                e.target.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.target.style.background = '#fff';
                e.target.style.color = '#1976d2';
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
                e.target.style.background = '#1565c0';
                e.target.style.borderColor = '#1565c0';
              }}
              onMouseLeave={e => {
                e.target.style.background = '#1976d2';
                e.target.style.borderColor = '#1976d2';
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
        background: '#D4A574', 
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
                    e.target.style.background = '#f5f5f5';
                    e.target.style.borderColor = '#999';
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.target.style.background = '#fff';
                    e.target.style.borderColor = '#ccc';
                    e.target.style.transform = 'translateY(0)';
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
        background: '#FFFACD', 
        marginTop: 0 
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#333', fontSize: 28 }}>Choose Your Pizza</h2>
        <table style={{ 
          width: '100%', 
          maxWidth: 1200, 
          margin: '0 auto', 
          borderCollapse: 'collapse',
          border: '2px solid #fff'
        }}>
          <thead>
            <tr>
              <th style={{ 
                padding: 16, 
                background: '#90EE90', 
                border: '2px solid #fff', 
                fontSize: 20, 
                fontWeight: 'bold',
                textAlign: 'center'
              }}>Veg</th>
              <th style={{ 
                padding: 16, 
                background: '#FFB6C1', 
                border: '2px solid #fff', 
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
                    </div>
                  )})}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>


      
      {/* Rest of the builder */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 20, maxWidth: 1400, margin: '0 auto' }}>
    

      <aside style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
        <h3>Build Summary</h3>
        <div style={{ marginBottom: 8 }}><strong>Crust:</strong> {selectedCrust}</div>
        <div style={{ marginBottom: 8 }}><strong>Size:</strong>
          <select value={size} onChange={e => setSize(e.target.value)} style={{ marginLeft: 8 }}>
            {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </aside>
      </div>
    </div>
  );
}
