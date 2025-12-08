import { Package, Clock, CheckCircle, Pizza } from 'lucide-react';
import type { Order } from '../App';

interface OrderHistoryProps {
  orders: Order[];
}

export default function OrderHistory({ orders }: OrderHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-gray-900">Order History</h1>
          </div>
          <p className="text-gray-600">View all your past orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-300" />
            </div>
            <h2 className="text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600">Your order history will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Pizza className="w-5 h-5 text-red-600" />
                      <h3 className="text-gray-900">Order #{order.id}</h3>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full">
                        <CheckCircle className="w-4 h-4" />
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Total</p>
                    <p className="text-red-600">Rs. {order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-gray-900 mb-3">Items ({order.pizzas.length})</h4>
                  <div className="space-y-3">
                    {order.pizzas.map((pizza) => (
                      <div
                        key={pizza.id}
                        className="flex justify-between items-start p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-gray-900">{pizza.name}</p>
                            {pizza.size && (
                              <span className="px-2 py-0.5 text-xs rounded-lg bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 capitalize border border-gray-200">
                                {pizza.size}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {pizza.ingredients.map((ing, index) => (
                              <span
                                key={ing.id}
                                className="text-gray-600 text-sm"
                              >
                                {ing.name}
                                {index < pizza.ingredients.length - 1 && ','}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-900 ml-4">Rs. {pizza.totalPrice.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}