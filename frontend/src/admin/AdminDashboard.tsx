import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, Pizza, Topping } from '../types';

interface NewPizza {
  name: string;
  description: string;
  category: 'Veg' | 'Non-Veg';
  price_regular: string;
  price_medium: string;
  price_large: string;
  img_url: string;
}

interface NewTopping {
  name: string;
  price: string;
}

interface NewAdmin {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('orders');
  const [loading, setLoading] = useState<boolean>(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);

  // Pizzas state
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [showAddPizza, setShowAddPizza] = useState<boolean>(false);
  const [newPizza, setNewPizza] = useState<NewPizza>({
    name: '',
    description: '',
    category: 'Veg',
    price_regular: '',
    price_medium: '',
    price_large: '',
    img_url: ''
  });

  // Toppings state
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [showAddTopping, setShowAddTopping] = useState<boolean>(false);
  const [newTopping, setNewTopping] = useState<NewTopping>({
    name: '',
    price: ''
  });

  // Admin state
  const [newAdmin, setNewAdmin] = useState<NewAdmin>({
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
      return;
    }
    // You could decode JWT to verify admin role here
    
    fetchOrders();
    fetchPizzas();
    fetchToppings();
  }, []);

  async function fetchOrders(): Promise<void> {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:4000/orders/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPizzas(): Promise<void> {
    try {
      const response = await fetch('http://localhost:4000/pizzas');
      if (response.ok) {
        const data = await response.json();
        setPizzas(data);
      }
    } catch (err) {
      console.error('Error fetching pizzas:', err);
    }
  }

  async function fetchToppings(): Promise<void> {
    try {
      const response = await fetch('http://localhost:4000/toppings');
      if (response.ok) {
        const data = await response.json();
        setToppings(data);
      }
    } catch (err) {
      console.error('Error fetching toppings:', err);
    }
  }

  async function handleAddPizza(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:4000/pizzas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPizza)
      });

      if (response.ok) {
        alert('Pizza added successfully!');
        setShowAddPizza(false);
        setNewPizza({
          name: '',
          description: '',
          category: 'Veg',
          price_regular: '',
          price_medium: '',
          price_large: '',
          img_url: ''
        });
        fetchPizzas();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to add pizza'}`);
      }
    } catch (err) {
      console.error('Error adding pizza:', err);
      alert('Failed to add pizza');
    }
  }

  async function handleDeletePizza(pizzaId: number): Promise<void> {
    if (!confirm('Are you sure you want to delete this pizza?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:4000/pizzas/${pizzaId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Pizza deleted successfully!');
        fetchPizzas();
      } else {
        alert('Failed to delete pizza');
      }
    } catch (err) {
      console.error('Error deleting pizza:', err);
      alert('Failed to delete pizza');
    }
  }

  async function handleAddTopping(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:4000/toppings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTopping)
      });

      if (response.ok) {
        alert('Topping added successfully!');
        setShowAddTopping(false);
        setNewTopping({ name: '', price: '' });
        fetchToppings();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to add topping'}`);
      }
    } catch (err) {
      console.error('Error adding topping:', err);
      alert('Failed to add topping');
    }
  }

  async function handleDeleteTopping(toppingId: number): Promise<void> {
    if (!confirm('Are you sure you want to delete this topping?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:4000/toppings/${toppingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Topping deleted successfully!');
        fetchToppings();
      } else {
        alert('Failed to delete topping');
      }
    } catch (err) {
      console.error('Error deleting topping:', err);
      alert('Failed to delete topping');
    }
  }

  async function handleAddAdmin(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    
    if (newAdmin.password !== newAdmin.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:4000/auth/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: newAdmin.email,
          password: newAdmin.password
        })
      });

      if (response.ok) {
        alert('Admin user created successfully!');
        setNewAdmin({ email: '', password: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to create admin'}`);
      }
    } catch (err) {
      console.error('Error creating admin:', err);
      alert('Failed to create admin user');
    }
  }

  async function handleOrderAction(orderId: number, action: string): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      const status = action === 'accept' ? 'confirmed' : 'cancelled';
      
      const response = await fetch(`http://localhost:4000/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        alert(`Order ${action === 'accept' ? 'accepted' : 'declined'} successfully!`);
        fetchOrders();
      } else {
        alert('Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Failed to update order');
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const tabStyle = (isActive: boolean) => ({
    padding: '12px 24px',
    fontSize: 16,
    fontWeight: isActive ? '600' : '500',
    color: isActive ? '#fff' : '#666',
    background: isActive ? '#1976d2' : '#f5f5f5',
    border: 'none',
    borderRadius: '8px 8px 0 0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderBottom: isActive ? 'none' : '2px solid #ddd'
  });

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '24px 32px',
        marginBottom: 20,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: 32, color: '#333', fontWeight: '700' }}>
          🍕 My Pizza Store - Admin Dashboard
        </h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate('/')}
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
          >
            View Store
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('authToken');
              navigate('/');
            }}
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
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          gap: 4,
          background: '#f5f5f5',
          padding: '8px 8px 0 8px'
        }}>
          <button style={tabStyle(activeTab === 'orders')} onClick={() => setActiveTab('orders')}>
            📦 Pending Orders
          </button>
          <button style={tabStyle(activeTab === 'pizzas')} onClick={() => setActiveTab('pizzas')}>
            🍕 Manage Pizzas
          </button>
          <button style={tabStyle(activeTab === 'toppings')} onClick={() => setActiveTab('toppings')}>
            🧀 Manage Toppings
          </button>
          <button style={tabStyle(activeTab === 'admins')} onClick={() => setActiveTab('admins')}>
            👤 Add Admin
          </button>
        </div>

        <div style={{ padding: 32 }}>
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ marginTop: 0, marginBottom: 24, fontSize: 24, color: '#333' }}>
                Pending Orders
              </h2>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Loading...</div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                  <p style={{ fontSize: 18, margin: 0 }}>No pending orders</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {orders.map(order => (
                    <div key={order.id} style={{
                      background: '#f8f9fa',
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      padding: 20
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: 16
                      }}>
                        <div>
                          <div style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
                            Order #{order.id}
                          </div>
                          <div style={{ fontSize: 14, color: '#666' }}>
                            {formatDate(order.created_at)}
                          </div>
                          {order.address_text && (
                            <div style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
                              <strong>Address:</strong> {order.address_text}
                            </div>
                          )}
                        </div>
                        <div style={{
                          fontSize: 22,
                          fontWeight: 'bold',
                          color: '#1976d2'
                        }}>
                          Rs. {Number(order.total_amount).toFixed(2)}
                        </div>
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{
                              background: '#fff',
                              padding: 12,
                              borderRadius: 6,
                              marginBottom: 8
                            }}>
                              <strong>{item.pizza_name}</strong> ({item.size})
                              {item.crust && ` - ${item.crust}`}
                              {item.quantity > 1 && ` × ${item.quantity}`}
                              {item.toppings && item.toppings.length > 0 && (
                                <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                                  Toppings: {item.toppings.join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 12 }}>
                        <button
                          onClick={() => handleOrderAction(order.id, 'accept')}
                          style={{
                            flex: 1,
                            padding: '12px 24px',
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#fff',
                            background: '#4caf50',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          ✓ Accept Order
                        </button>
                        <button
                          onClick={() => handleOrderAction(order.id, 'decline')}
                          style={{
                            flex: 1,
                            padding: '12px 24px',
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#fff',
                            background: '#f44336',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          ✗ Decline Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pizzas Tab */}
          {activeTab === 'pizzas' && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24
              }}>
                <h2 style={{ margin: 0, fontSize: 24, color: '#333' }}>Manage Pizzas</h2>
                <button
                  onClick={() => setShowAddPizza(!showAddPizza)}
                  style={{
                    padding: '10px 24px',
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#fff',
                    background: '#4caf50',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  + Add New Pizza
                </button>
              </div>

              {showAddPizza && (
                <form onSubmit={handleAddPizza} style={{
                  background: '#f8f9fa',
                  padding: 24,
                  borderRadius: 8,
                  marginBottom: 24,
                  border: '2px solid #4caf50'
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 20 }}>Add New Pizza</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: '500' }}>
                        Name *
                      </label>
                      <input
                        required
                        value={newPizza.name}
                        onChange={e => setNewPizza({ ...newPizza, name: e.currentTarget.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: 15,
                          border: '1px solid #ddd',
                          borderRadius: 6
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: '500' }}>
                        Category *
                      </label>
                      <select
                        required
                        value={newPizza.category}
                        onChange={e => setNewPizza({ ...newPizza, category: e.currentTarget.value as 'Veg' | 'Non-Veg' })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: 15,
                          border: '1px solid #ddd',
                          borderRadius: 6
                        }}
                      >
                        <option value="Veg">Veg</option>
                        <option value="Non-Veg">Non-Veg</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: '500' }}>
                        Description
                      </label>
                      <textarea
                        value={newPizza.description}
                        onChange={e => setNewPizza({ ...newPizza, description: e.currentTarget.value })}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: 15,
                          border: '1px solid #ddd',
                          borderRadius: 6,
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: '500' }}>
                        Regular Price (Rs) *
                      </label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={newPizza.price_regular}
                        onChange={e => setNewPizza({ ...newPizza, price_regular: e.currentTarget.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: 15,
                          border: '1px solid #ddd',
                          borderRadius: 6
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: '500' }}>
                        Medium Price (Rs) *
                      </label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={newPizza.price_medium}
                        onChange={e => setNewPizza({ ...newPizza, price_medium: e.currentTarget.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: 15,
                          border: '1px solid #ddd',
                          borderRadius: 6
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: '500' }}>
                        Large Price (Rs) *
                      </label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={newPizza.price_large}
                        onChange={e => setNewPizza({ ...newPizza, price_large: e.currentTarget.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: 15,
                          border: '1px solid #ddd',
                          borderRadius: 6
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: '500' }}>
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={newPizza.img_url}
                        onChange={e => setNewPizza({ ...newPizza, img_url: e.currentTarget.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: 15,
                          border: '1px solid #ddd',
                          borderRadius: 6
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                    <button
                      type="submit"
                      style={{
                        padding: '12px 24px',
                        fontSize: 16,
                        fontWeight: '600',
                        color: '#fff',
                        background: '#4caf50',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                    >
                      Add Pizza
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddPizza(false)}
                      style={{
                        padding: '12px 24px',
                        fontSize: 16,
                        fontWeight: '600',
                        color: '#666',
                        background: '#f5f5f5',
                        border: '1px solid #ddd',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {pizzas.map(pizza => (
                  <div key={pizza.pizza_id} style={{
                    background: '#f8f9fa',
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {pizza.img_url && (
                      <div style={{
                        width: '100%',
                        height: 150,
                        background: `url(${pizza.img_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: 6,
                        marginBottom: 12
                      }} />
                    )}
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>
                      {pizza.name}
                      <span style={{
                        marginLeft: 8,
                        padding: '2px 8px',
                        fontSize: 12,
                        background: pizza.category === 'Veg' ? '#90EE90' : '#FFB6C1',
                        borderRadius: 4
                      }}>
                        {pizza.category}
                      </span>
                    </h3>
                    {pizza.description && (
                      <p style={{ fontSize: 13, color: '#666', margin: '0 0 12px 0' }}>
                        {pizza.description}
                      </p>
                    )}
                    <div style={{ fontSize: 14, marginBottom: 12 }}>
                      <div><strong>Regular:</strong> Rs. {Number(pizza.price_regular).toFixed(2)}</div>
                      <div><strong>Medium:</strong> Rs. {Number(pizza.price_medium).toFixed(2)}</div>
                      <div><strong>Large:</strong> Rs. {Number(pizza.price_large).toFixed(2)}</div>
                    </div>
                    <button
                      onClick={() => handleDeletePizza(pizza.pizza_id!)}
                      style={{
                        marginTop: 'auto',
                        padding: '8px 16px',
                        fontSize: 14,
                        fontWeight: '600',
                        color: '#fff',
                        background: '#f44336',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toppings Tab */}
          {activeTab === 'toppings' && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24
              }}>
                <h2 style={{ margin: 0, fontSize: 24, color: '#333' }}>Manage Toppings</h2>
                <button
                  onClick={() => setShowAddTopping(!showAddTopping)}
                  style={{
                    padding: '10px 24px',
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#fff',
                    background: '#4caf50',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  + Add New Topping
                </button>
              </div>

              {showAddTopping && (
                <form onSubmit={handleAddTopping} style={{
                  background: '#f8f9fa',
                  padding: 24,
                  borderRadius: 8,
                  marginBottom: 24,
                  border: '2px solid #4caf50'
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 20 }}>Add New Topping</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: '500' }}>
                        Name *
                      </label>
                      <input
                        required
                        value={newTopping.name}
                        onChange={e => setNewTopping({ ...newTopping, name: e.currentTarget.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: 15,
                          border: '1px solid #ddd',
                          borderRadius: 6
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: '500' }}>
                        Price (Rs) *
                      </label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={newTopping.price}
                        onChange={e => setNewTopping({ ...newTopping, price: e.currentTarget.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: 15,
                          border: '1px solid #ddd',
                          borderRadius: 6
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                    <button
                      type="submit"
                      style={{
                        padding: '12px 24px',
                        fontSize: 16,
                        fontWeight: '600',
                        color: '#fff',
                        background: '#4caf50',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                    >
                      Add Topping
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddTopping(false)}
                      style={{
                        padding: '12px 24px',
                        fontSize: 16,
                        fontWeight: '600',
                        color: '#666',
                        background: '#f5f5f5',
                        border: '1px solid #ddd',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                background: '#fff',
                borderRadius: 8,
                overflow: 'hidden'
              }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: 16, textAlign: 'left', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: 16, textAlign: 'left', fontWeight: '600' }}>Price</th>
                    <th style={{ padding: 16, textAlign: 'right', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {toppings.map(topping => (
                    <tr key={topping.topping_id} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: 16 }}>{topping.name}</td>
                      <td style={{ padding: 16 }}>Rs. {Number(topping.price).toFixed(2)}</td>
                      <td style={{ padding: 16, textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteTopping(topping.topping_id!)}
                          style={{
                            padding: '6px 16px',
                            fontSize: 14,
                            fontWeight: '600',
                            color: '#fff',
                            background: '#f44336',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Admin Tab */}
          {activeTab === 'admins' && (
            <div>
              <h2 style={{ marginTop: 0, marginBottom: 24, fontSize: 24, color: '#333' }}>
                Add New Admin User
              </h2>

              <form onSubmit={handleAddAdmin} style={{
                background: '#f8f9fa',
                padding: 24,
                borderRadius: 8,
                maxWidth: 600,
                border: '2px solid #1976d2'
              }}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: '500' }}>
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    value={newAdmin.email}
                    onChange={e => setNewAdmin({ ...newAdmin, email: e.currentTarget.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: 15,
                      border: '1px solid #ddd',
                      borderRadius: 6
                    }}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: '500' }}>
                    Password *
                  </label>
                  <input
                    required
                    type="password"
                    minLength={6}
                    value={newAdmin.password}
                    onChange={e => setNewAdmin({ ...newAdmin, password: e.currentTarget.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: 15,
                      border: '1px solid #ddd',
                      borderRadius: 6
                    }}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: '500' }}>
                    Confirm Password *
                  </label>
                  <input
                    required
                    type="password"
                    minLength={6}
                    value={newAdmin.confirmPassword}
                    onChange={e => setNewAdmin({ ...newAdmin, confirmPassword: e.currentTarget.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: 15,
                      border: '1px solid #ddd',
                      borderRadius: 6
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#fff',
                    background: '#1976d2',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  Create Admin User
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
