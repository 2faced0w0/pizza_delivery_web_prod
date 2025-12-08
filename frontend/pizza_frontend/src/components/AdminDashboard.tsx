import { useEffect, useState } from 'react';
import { Plus, Trash2, Package, Sparkles, ClipboardList, CheckCircle, XCircle } from 'lucide-react';
import type { Ingredient } from '../App';
import { toast } from 'sonner';
import { api } from '../api/client';

interface PendingOrderItem {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface AdminDashboardProps {
  ingredients: Ingredient[];
  addIngredient: (ingredient: Ingredient) => void;
  removeIngredient: (id: string) => void;
}

export default function AdminDashboard({
  ingredients,
  addIngredient,
  removeIngredient,
}: AdminDashboardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    price: '',
    category: 'vegetable' as Ingredient['category'],
    image: '',
  });
  const [pendingOrders, setPendingOrders] = useState<PendingOrderItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [pizzas, setPizzas] = useState<any[]>([]);
  const [loadingPizzas, setLoadingPizzas] = useState(false);
  const [showAddPizzaForm, setShowAddPizzaForm] = useState(false);
  const [editingPizzaId, setEditingPizzaId] = useState<number | null>(null);
  const [editingFields, setEditingFields] = useState<{ name?: string; category?: string; price_regular?: string; price_medium?: string; price_large?: string; img_url?: string }>({});
  const [lastUpdatedPizzaId, setLastUpdatedPizzaId] = useState<number | null>(null);
  const [newPizza, setNewPizza] = useState({
    name: '',
    description: '',
    category: 'classic',
    price_regular: '',
    price_medium: '',
    price_large: '',
    img_url: '',
  });

  const fetchPendingOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.get('/orders/pending');
      const data = Array.isArray(res.data?.data) ? res.data.data : res.data;
      const arr = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      const mapped: PendingOrderItem[] = arr
        .map((o: any) => ({
          id: String(o.id),
          totalAmount: Number(o.total_amount ?? 0),
          status: String(o.status ?? ''),
          createdAt: String(o.created_at ?? new Date().toISOString()),
        }))
        .filter((o: PendingOrderItem) => o.status.toLowerCase() === 'pending');
      setPendingOrders(mapped);
    } catch (e) {
      console.error('Failed to load pending orders', e);
      toast.error('Failed to load pending orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
    const timer = window.setInterval(fetchPendingOrders, 15000);
    return () => window.clearInterval(timer);
  }, []);

  const fetchPizzas = async () => {
    setLoadingPizzas(true);
    try {
      const res = await api.get('/pizzas');
      const data = Array.isArray(res.data?.data) ? res.data.data : res.data;
      const arr = Array.isArray(data) ? data : [];
      setPizzas(arr);
    } catch (e) {
      console.error('Failed to load pizzas', e);
      toast.error('Failed to load pizzas');
    } finally {
      setLoadingPizzas(false);
    }
  };

  useEffect(() => {
    fetchPizzas();
  }, []);

  const confirmOrder = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'confirmed' });
      toast.success(`Order #${orderId} confirmed`);
      // Refresh list
      fetchPendingOrders();
    } catch (e) {
      console.error('Failed to confirm order', e);
      toast.error('Failed to confirm order');
    }
  };

  const declineOrder = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'cancelled' });
      toast.success(`Order #${orderId} declined`);
      fetchPendingOrders();
    } catch (e) {
      console.error('Failed to decline order', e);
      toast.error('Failed to decline order');
    }
  };

  const handleAddPizza = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, description, category, price_regular, price_medium, price_large, img_url } = newPizza;
    if (!name || !category || !price_regular || !price_medium || !price_large) {
      toast.error('Please provide name, category, and all three prices');
      return;
    }
    try {
      await api.post('/pizzas', {
        name,
        description,
        category,
        price_regular: parseFloat(price_regular),
        price_medium: parseFloat(price_medium),
        price_large: parseFloat(price_large),
        img_url,
      });
      toast.success('Pizza added');
      setShowAddPizzaForm(false);
      setNewPizza({ name: '', description: '', category: 'classic', price_regular: '', price_medium: '', price_large: '', img_url: '' });
      fetchPizzas();
    } catch (e) {
      console.error('Failed to add pizza', e);
      toast.error('Failed to add pizza');
    }
  };

  const handleRemovePizza = async (pizzaId: number) => {
    try {
      await api.delete(`/pizzas/${pizzaId}`);
      toast.success('Pizza removed');
      fetchPizzas();
    } catch (e) {
      console.error('Failed to remove pizza', e);
      toast.error('Failed to remove pizza');
    }
  };

  const startEditPizza = (p: any) => {
    setEditingPizzaId(Number(p.pizza_id));
    setEditingFields({
      name: p.name ?? '',
      category: p.category ?? '',
      price_regular: String(p.price_regular ?? ''),
      price_medium: String(p.price_medium ?? ''),
      price_large: String(p.price_large ?? ''),
      img_url: p.img_url ?? '',
    });
  };

  const cancelEditPizza = () => {
    setEditingPizzaId(null);
    setEditingFields({});
  };

  const saveEditPizza = async () => {
    if (!editingPizzaId) return;
    const payload: any = {};
    if (editingFields.name !== undefined) payload.name = editingFields.name;
    if (editingFields.category !== undefined) payload.category = editingFields.category;
    if (editingFields.img_url !== undefined) payload.img_url = editingFields.img_url;
    if (editingFields.price_regular !== undefined) payload.price_regular = parseFloat(editingFields.price_regular || '0');
    if (editingFields.price_medium !== undefined) payload.price_medium = parseFloat(editingFields.price_medium || '0');
    if (editingFields.price_large !== undefined) payload.price_large = parseFloat(editingFields.price_large || '0');
    try {
      await api.patch(`/pizzas/${editingPizzaId}`, payload);
      toast.success('Pizza updated');
      setEditingPizzaId(null);
      setEditingFields({});
      setLastUpdatedPizzaId(editingPizzaId);
      fetchPizzas();
    } catch (e) {
      console.error('Failed to update pizza', e);
      toast.error('Failed to update pizza');
    }
  };

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newIngredient.name || !newIngredient.price || !newIngredient.image) {
      toast.error('Please fill in all fields');
      return;
    }

    const ingredient: Ingredient = {
      id: Date.now().toString(),
      name: newIngredient.name,
      price: parseFloat(newIngredient.price),
      category: newIngredient.category,
      image: newIngredient.image,
    };

    addIngredient(ingredient);
    toast.success('Ingredient added successfully!');
    setNewIngredient({ name: '', price: '', category: 'vegetable', image: '' });
    setShowAddForm(false);
  };

  const handleRemoveIngredient = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      removeIngredient(id);
      toast.success('Ingredient removed successfully!');
    }
  };

  const categories = ['base', 'sauce', 'cheese', 'meat', 'vegetable', 'other'] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage your pizza ingredients inventory</p>
        </div>

        <div className="mb-6 grid md:grid-cols-2 gap-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add New Ingredient
          </button>

          <button
            onClick={() => setShowAddPizzaForm(!showAddPizzaForm)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add New Pizza
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-red-600" />
              <h2 className="text-gray-900">Pending Orders</h2>
              <span className="ml-auto bg-gradient-to-r from-red-100 to-orange-100 text-red-700 px-3 py-1 rounded-full">
                {pendingOrders.length}
              </span>
            </div>
            {loadingOrders ? (
              <p className="text-gray-600">Loading pending orders...</p>
            ) : pendingOrders.length === 0 ? (
              <p className="text-gray-600">No pending orders</p>
            ) : (
              <div className="space-y-3">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                    <div>
                      <p className="text-gray-900">Order #{order.id}</p>
                      <p className="text-gray-600 text-sm">Rs. {order.totalAmount.toFixed(2)} • {new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => confirmOrder(order.id)}
                        className="inline-flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Confirm
                      </button>
                      <button
                        onClick={() => declineOrder(order.id)}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-lg hover:shadow-md transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showAddPizzaForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-8">
            <h2 className="text-gray-900 mb-4">Add New Pizza</h2>
            <form onSubmit={handleAddPizza} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Name</label>
                <input type="text" value={newPizza.name} onChange={(e) => setNewPizza({ ...newPizza, name: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Category</label>
                <input type="text" value={newPizza.category} onChange={(e) => setNewPizza({ ...newPizza, category: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Description</label>
                <input type="text" value={newPizza.description} onChange={(e) => setNewPizza({ ...newPizza, description: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Price (Regular)</label>
                <input type="number" step="0.01" value={newPizza.price_regular} onChange={(e) => setNewPizza({ ...newPizza, price_regular: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Price (Medium)</label>
                <input type="number" step="0.01" value={newPizza.price_medium} onChange={(e) => setNewPizza({ ...newPizza, price_medium: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Price (Large)</label>
                <input type="number" step="0.01" value={newPizza.price_large} onChange={(e) => setNewPizza({ ...newPizza, price_large: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Image URL</label>
                <input type="text" value={newPizza.img_url} onChange={(e) => setNewPizza({ ...newPizza, img_url: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all">Add Pizza</button>
                <button type="button" onClick={() => setShowAddPizzaForm(false)} className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-red-600" />
              <h2 className="text-gray-900">Current Pizzas</h2>
              <span className="ml-auto bg-gradient-to-r from-red-100 to-orange-100 text-red-700 px-3 py-1 rounded-full">
                {pizzas.length} items
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loadingPizzas ? (
              <div className="p-6 text-gray-600">Loading pizzas...</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-700">Name</th>
                    <th className="text-left px-6 py-3 text-gray-700">Category</th>
                    <th className="text-left px-6 py-3 text-gray-700">Regular</th>
                    <th className="text-left px-6 py-3 text-gray-700">Medium</th>
                    <th className="text-left px-6 py-3 text-gray-700">Large</th>
                    <th className="text-right px-6 py-3 text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pizzas.map((p: any) => (
                    <tr key={p.pizza_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900">
                        {editingPizzaId === Number(p.pizza_id) ? (
                          <input value={editingFields.name ?? ''} onChange={(e) => setEditingFields({ ...editingFields, name: e.target.value })} className="px-3 py-1 border border-gray-200 rounded" />
                        ) : (
                          p.name
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {editingPizzaId === Number(p.pizza_id) ? (
                          <input value={editingFields.category ?? ''} onChange={(e) => setEditingFields({ ...editingFields, category: e.target.value })} className="px-3 py-1 border border-gray-200 rounded" />
                        ) : (
                          p.category
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {editingPizzaId === Number(p.pizza_id) ? (
                          <input type="number" step="0.01" value={editingFields.price_regular ?? ''} onChange={(e) => setEditingFields({ ...editingFields, price_regular: e.target.value })} className="px-3 py-1 border border-gray-200 rounded w-28" />
                        ) : (
                          `Rs. ${Number(p.price_regular ?? 0).toFixed(2)}`
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {editingPizzaId === Number(p.pizza_id) ? (
                          <input type="number" step="0.01" value={editingFields.price_medium ?? ''} onChange={(e) => setEditingFields({ ...editingFields, price_medium: e.target.value })} className="px-3 py-1 border border-gray-200 rounded w-28" />
                        ) : (
                          `Rs. ${Number(p.price_medium ?? 0).toFixed(2)}`
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {editingPizzaId === Number(p.pizza_id) ? (
                          <input type="number" step="0.01" value={editingFields.price_large ?? ''} onChange={(e) => setEditingFields({ ...editingFields, price_large: e.target.value })} className="px-3 py-1 border border-gray-200 rounded w-28" />
                        ) : (
                          <span>
                            {`Rs. ${Number(p.price_large ?? 0).toFixed(2)}`}
                            {lastUpdatedPizzaId === Number(p.pizza_id) && (
                              <span className="ml-2 px-2 py-0.5 text-xs rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-emerald-200">Updated</span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingPizzaId === Number(p.pizza_id) ? (
                          <div className="inline-flex gap-2">
                            <button onClick={saveEditPizza} className="text-green-600 hover:text-green-700 transition-colors inline-flex items-center gap-1 hover:bg-green-50 px-3 py-1.5 rounded-lg">
                              Save
                            </button>
                            <button onClick={cancelEditPizza} className="text-gray-600 hover:text-gray-700 transition-colors inline-flex items-center gap-1 hover:bg-gray-50 px-3 py-1.5 rounded-lg">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex gap-2">
                            <button onClick={() => startEditPizza(p)} className="text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 hover:bg-blue-50 px-3 py-1.5 rounded-lg">Edit</button>
                            <button onClick={() => handleRemovePizza(Number(p.pizza_id))} className="text-red-600 hover:text-red-700 transition-colors inline-flex items-center gap-1 hover:bg-red-50 px-3 py-1.5 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-8">
            <h2 className="text-gray-900 mb-4">Add New Ingredient</h2>
            <form onSubmit={handleAddIngredient} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Ingredient Name
                </label>
                <input
                  type="text"
                  value={newIngredient.name}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="e.g., Extra Cheese"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Price (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newIngredient.price}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, price: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Category</label>
                <select
                  value={newIngredient.category}
                  onChange={(e) =>
                    setNewIngredient({
                      ...newIngredient,
                      category: e.target.value as Ingredient['category'],
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Image Search Term
                </label>
                <input
                  type="text"
                  value={newIngredient.image}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, image: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="e.g., mozzarella cheese"
                />
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                >
                  Add Ingredient
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
<br />
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-red-600" />
              <h2 className="text-gray-900">Current Inventory</h2>
              <span className="ml-auto bg-gradient-to-r from-red-100 to-orange-100 text-red-700 px-3 py-1 rounded-full">
                {ingredients.length} items
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-700">Name</th>
                  <th className="text-left px-6 py-3 text-gray-700">Category</th>
                  <th className="text-left px-6 py-3 text-gray-700">Price</th>
                  <th className="text-left px-6 py-3 text-gray-700">Image Term</th>
                  <th className="text-right px-6 py-3 text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ingredients.map((ingredient) => (
                  <tr key={ingredient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900">{ingredient.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-lg capitalize">
                        {ingredient.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      ${ingredient.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{ingredient.image}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          handleRemoveIngredient(ingredient.id, ingredient.name)
                        }
                        className="text-red-600 hover:text-red-700 transition-colors inline-flex items-center gap-1 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}