import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from './api/client';
// Ingredient mapping removed; categories/images are not pre-mapped
import  Header from './components/Header';
import  Footer from './components/Footer';
import  PizzaBuilder from './components/PizzaBuilder';
import  Cart from './components/Cart';
import  AdminDashboard  from './components/AdminDashboard';
import  Auth from './components/Auth';
import  OrderHistory from './components/OrderHistory';

export interface Ingredient {
  id: string;
  name: string;
  price: number;
  category: 'base' | 'sauce' | 'cheese' | 'meat' | 'vegetable' | 'other';
  image: string;
}

export interface Pizza {
  id: string;
  name: string;
  ingredients: Ingredient[];
  totalPrice: number;
  size?: 'small' | 'medium' | 'large';
  basePizzaId?: number;
}

export interface Order {
  id: string;
  userId: string;
  pizzas: Pizza[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
}

export default function App() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [pizzasCatalog, setPizzasCatalog] = useState<{ pizza_id: number; name: string; price_regular?: number; price_medium?: number; price_large?: number }[]>([]);

  const [cart, setCart] = useState<Pizza[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const setSessionCookie = (name: string, value: string) => {
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/`;
  };
  const getSessionCookie = (name: string): string | null => {
    const key = encodeURIComponent(name) + '=';
    const parts = document.cookie.split(';');
    for (let p of parts) {
      p = p.trim();
      if (p.startsWith(key)) return decodeURIComponent(p.substring(key.length));
    }
    return null;
  };

  useEffect(() => {
    // Hydrate initial data from API
    (async () => {
      try {
        const res = await api.get('/toppings');
        const raw = res.data;
        const arr = Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw)
          ? raw
          : [];

        const mapped: Ingredient[] = arr.map((t: any) => {
          const name = String(t.name);
          return {
            id: String(t.topping_id ?? t.id ?? name),
            name,
            price: Number(t.price ?? 0),
            category: 'other',
            image: String(t.image || ''),
          };
        });
        setIngredients(mapped);
      } catch (e) {
        // Leave ingredients empty on error; UI can still function
        console.error('Failed to load toppings', e);
      }
    })();

    // Fetch pizzas catalog for order mapping
    (async () => {
      try {
        const res = await api.get('/pizzas');
        const raw = res.data;
        const arr = Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw)
          ? raw
          : [];
        setPizzasCatalog(arr.map((p: any) => ({
          pizza_id: Number(p.pizza_id ?? p.id),
          name: String(p.name),
          price_regular: p.price_regular ? Number(p.price_regular) : undefined,
          price_medium: p.price_medium ? Number(p.price_medium) : undefined,
          price_large: p.price_large ? Number(p.price_large) : undefined,
        })));
      } catch (e) {
        console.error('Failed to load pizzas', e);
      }
    })();

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const cookieCart = getSessionCookie('cart');
    if (cookieCart) {
      try { setCart(JSON.parse(cookieCart)); } catch {}
    } else {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    }
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  useEffect(() => {
    // Persist cart in session cookie and localStorage
    const payload = JSON.stringify(cart);
    setSessionCookie('cart', payload);
    localStorage.setItem('cart', payload);
  }, [cart]);

  // Poll user's orders to reflect status changes in near real-time
  useEffect(() => {
    if (!user) return;
    let timer: number | undefined;
    const fetchMyOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // No auth token yet; skip this poll iteration
          return;
        }
        const res = await api.get('/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(res.data?.data) ? res.data.data : res.data;
        const mappedOrders: Order[] = (data || []).map((o: any) => ({
          id: String(o.id),
          userId: String(user.id),
          pizzas: [],
          totalAmount: Number(o.total_amount ?? 0),
          status: String(o.status ?? ''),
          createdAt: String(o.created_at ?? new Date().toISOString()),
        }));
        setOrders(mappedOrders);
      } catch (e) {
        // Silent failure to avoid toast noise during background polling
        const err = e as { response?: { status?: number } };
        if (err.response && err.response.status === 401) {
          // Unauthorized; likely expired/missing token. Skip until next iteration.
          return;
        }
        console.error('Orders poll failed', e);
      }
    };
    // initial fetch then interval
    fetchMyOrders();
    timer = window.setInterval(fetchMyOrders, 15000);
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [user]);

  const addToCart = (pizza: Pizza) => {
    setCart([...cart, pizza]);
  };

  const removeFromCart = (pizzaId: string) => {
    setCart(cart.filter(p => p.id !== pizzaId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const placeOrder = async () => {
    if (!user) return;
    try {
      // Map cart to backend order items
      const items = cart.map((pizza) => {
        const matchById = pizza.basePizzaId
          ? pizzasCatalog.find((p) => p.pizza_id === pizza.basePizzaId)
          : undefined;
        const matchByName = pizzasCatalog.find((p) => p.name.toLowerCase() === pizza.name.toLowerCase());
        const match = matchById || matchByName;
        // Map toppings by ingredient names to topping ids from loaded ingredients
        const toppingIds = pizza.ingredients
          .map((ing) => {
            const found = ingredients.find((t) => t.name.toLowerCase() === ing.name.toLowerCase());
            // Only include non-base/sauce/cheese categories as toppings
            const isTopping = ing.category === 'meat' || ing.category === 'vegetable' || ing.category === 'other';
            return isTopping && found ? Number(found.id) : null;
          })
          .filter((id): id is number => id !== null);
        return {
          pizza_id: match?.pizza_id ?? null,
          size: pizza.size ? pizza.size : 'regular',
          crust: 'thin',
          quantity: 1,
          unit_price: pizza.totalPrice,
          toppings: toppingIds,
        };
      }).filter(i => i.pizza_id !== null);

      const address_text = 'Online order';
      const total_amount = cart.reduce((sum, p) => sum + p.totalPrice, 0);
      await api.post('/orders', { items, address_text, total_amount });
      // Refresh orders from backend
      const res = await api.get('/orders/my-orders');
      const data = Array.isArray(res.data?.data) ? res.data.data : res.data;
      const mappedOrders: Order[] = (data || []).map((o: any) => ({
        id: String(o.id),
        userId: String(user.id),
        pizzas: Array.isArray(o.items)
          ? o.items.map((it: any, idx: number) => ({
              id: String(it.id ?? `${o.id}-${idx}`),
              name: String(it.pizza_name ?? it.name ?? 'Pizza'),
              size: String(it.size ?? 'regular'),
              ingredients: Array.isArray(it.toppings)
                ? it.toppings.map((t: any, ti: number) => ({
                    id: String(t.id ?? `${it.id}-${ti}`),
                    name: String(t.name ?? t),
                    price: Number(t.price ?? 0),
                    category: String(t.category ?? 'other') as any,
                    image: String(t.image ?? ''),
                  }))
                : [],
              totalPrice: Number(it.unit_price ?? it.price ?? 0),
            }))
          : [],
        totalAmount: Number(o.total_amount ?? 0),
        status: String(o.status ?? ''),
        createdAt: String(o.created_at ?? new Date().toISOString()),
      }));
      setOrders(mappedOrders);
      clearCart();
    } catch (e) {
      console.error('Failed to place order', e);
    }
  };

  const addIngredient = (ingredient: Ingredient) => {
    const newIngredient = { ...ingredient, id: Date.now().toString() };
    setIngredients([...ingredients, newIngredient]);
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const login = async (email: string, password = 'secret') => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data?.data ?? res.data;
      const token = data?.token ?? res.data?.token;
      const userData = data?.user ?? res.data?.user;
      if (token) localStorage.setItem('token', token);
      const newUser: User = {
        id: String(userData?.id ?? Date.now().toString()),
        email: String(userData?.email ?? email),
        name: (userData?.email ?? email).split('@')[0],
        isAdmin: (userData?.role ?? '') === 'admin',
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      // Fetch existing orders
      const ordRes = await api.get('/orders/my-orders');
      const ord = Array.isArray(ordRes.data?.data) ? ordRes.data.data : ordRes.data;
      const mappedOrders: Order[] = (ord || []).map((o: any) => ({
        id: String(o.id),
        userId: String(newUser.id),
        pizzas: Array.isArray(o.items)
          ? o.items.map((it: any, idx: number) => ({
              id: String(it.id ?? `${o.id}-${idx}`),
              name: String(it.pizza_name ?? it.name ?? 'Pizza'),
              size: String(it.size ?? 'regular'),
              ingredients: Array.isArray(it.toppings)
                ? it.toppings.map((t: any, ti: number) => ({
                    id: String(t.id ?? `${it.id}-${ti}`),
                    name: String(t.name ?? t),
                    price: Number(t.price ?? 0),
                    category: String(t.category ?? 'other') as any,
                    image: String(t.image ?? ''),
                  }))
                : [],
              totalPrice: Number(it.unit_price ?? it.price ?? 0),
            }))
          : [],
        totalAmount: Number(o.total_amount ?? 0),
        status: String(o.status ?? ''),
        createdAt: String(o.created_at ?? new Date().toISOString()),
      }));
      setOrders(mappedOrders);
      return true;
    } catch (e) {
      console.error('Login failed', e);
      return false;
    }
  };

  // Pass the async login directly; Auth awaits it.

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header user={user} logout={logout} cartCount={cart.length} />
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <PizzaBuilder
                  ingredients={ingredients}
                  addToCart={addToCart}
                />
              }
            />
            <Route
              path="/cart"
              element={
                <Cart
                  cart={cart}
                  removeFromCart={removeFromCart}
                  user={user}
                  placeOrder={placeOrder}
                />
              }
            />
            <Route
              path="/auth"
              element={
                user ? <Navigate to="/" /> : <Auth login={login} />
              }
            />
            <Route
              path="/orders"
              element={
                user ? (
                  <OrderHistory orders={orders.filter(o => o.userId === user.id)} />
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/admin"
              element={
                user?.isAdmin ? (
                  <AdminDashboard
                    ingredients={ingredients}
                    addIngredient={addIngredient}
                    removeIngredient={removeIngredient}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}