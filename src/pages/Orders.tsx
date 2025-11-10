import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Order } from '../lib/supabase';

interface OrdersProps {
  onNavigate: (page: string) => void;
}

export const Orders = ({ onNavigate }: OrdersProps) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as Order[]);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <p className="text-xl text-white/80 mb-4">Please login to view your orders</p>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-2 bg-[#C8A962] text-white rounded-lg hover:bg-[#C8A962] transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-white/80">Loading...</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-lg">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-white/80 mb-4">No orders yet</p>
            <button
              onClick={() => onNavigate('home')}
              className="px-6 py-2 bg-[#C8A962] text-white rounded-lg hover:bg-[#C8A962] transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-white/80">Order Number</p>
                    <p className="text-lg font-bold text-white">{order.order_number}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/80">Order Date</span>
                    <span className="text-white">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/80">Total Amount</span>
                    <span className="text-lg font-bold text-white">
                      ₹{order.total_amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
