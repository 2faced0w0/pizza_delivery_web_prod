import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Trash2, ShoppingBag, ArrowLeft, Sparkles } from 'lucide-react';
import type { Pizza, User } from '../App';
import { toast } from 'sonner';

interface CartProps {
  cart: Pizza[];
  removeFromCart: (pizzaId: string) => void;
  user: User | null;
  placeOrder: () => void;
}

export default function Cart({ cart, removeFromCart, user, placeOrder }: CartProps) {
  const navigate = useNavigate();
  const [isPlacing, setIsPlacing] = useState(false);
  const totalAmount = cart.reduce((sum, pizza) => sum + pizza.totalPrice, 0);

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/auth');
      return;
    }

    if (cart.length === 0) {
      toast.warning('Your cart is empty');
      return;
    }

    try {
      setIsPlacing(true);
      // Await order creation to ensure it is persisted (status: pending)
      await Promise.resolve(placeOrder());
      toast.success('Order placed successfully!');
      navigate('/orders');
      // Ensure UI reflects the cleared cart and latest orders
      window.location.reload();
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors px-4 py-2 rounded-lg hover:bg-white"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-gray-900">Shopping Cart</h1>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-gray-300" />
              </div>
              <h2 className="text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some delicious pizzas to get started!</p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Build Your Pizza
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.map((pizza) => (
                  <div
                    key={pizza.id}
                    className="flex flex-col sm:flex-row gap-4 p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:border-red-200 transition-all group"
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-gray-900">{pizza.name}</h3>
                        <p className="text-red-600 ml-4">Rs. {pizza.totalPrice.toFixed(2)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {pizza.ingredients.map((ing) => (
                          <span
                            key={ing.id}
                            className="px-3 py-1.5 bg-white text-gray-700 rounded-lg text-sm border border-gray-200"
                          >
                            {ing.name}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-500">
                        {pizza.ingredients.length} ingredient{pizza.ingredients.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(pizza.id)}
                      className="sm:self-start text-gray-400 hover:text-red-600 transition-colors p-3 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 mb-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Subtotal</span>
                     <span className="text-gray-900">Rs. {totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-200 mt-3 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Total Amount</span>
                       <span className="text-red-600">Rs. {totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {!user && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-4">
                    <p className="text-amber-800">
                      Please login or register to place your order
                    </p>
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacing || cart.length === 0}
                  className={`w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 ${
                    isPlacing || cart.length === 0 ? 'opacity-70 cursor-not-allowed hover:scale-100' : ''
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {user ? (isPlacing ? 'Placing Order...' : 'Place Order') : 'Login to Place Order'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}