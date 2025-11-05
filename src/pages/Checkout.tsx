import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, CartItem, Product } from '../lib/supabase';
import { Check } from 'lucide-react';

interface CheckoutProps {
  onNavigate: (page: string) => void;
}

export const Checkout = ({ onNavigate }: CheckoutProps) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<(CartItem & { product: Product })[]>([]);
  const [step, setStep] = useState(1);
  const [orderNumber, setOrderNumber] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', user.id);

    if (!error && data) {
      setCartItems(data as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const orderNum = `ORD-${Date.now()}`;
      const total = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

      const { error } = await supabase.from('orders').insert({
        user_id: user?.id,
        order_number: orderNum,
        total_amount: total,
        status: 'pending',
        shipping_address: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        contact_info: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        },
      });

      if (!error) {
        await supabase.from('cart_items').delete().eq('user_id', user?.id);
        setOrderNumber(orderNum);
        setStep(3);
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Please login to checkout</p>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-2 bg-[#0B1D39] text-white rounded-lg hover:bg-[#C8A962] transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-2 bg-[#0B1D39] text-white rounded-lg hover:bg-[#C8A962] transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const total = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="bg-white rounded-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 mb-4">Thank you for your purchase</p>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600 mb-1">Order Number</p>
            <p className="text-xl font-bold text-[#C8A962]">{orderNumber}</p>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            You will receive an email confirmation shortly.
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="w-full bg-[#0B1D39] text-white py-3 rounded-lg hover:bg-[#C8A962] transition-colors font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#C8A962] text-white' : 'bg-gray-300 text-gray-600'}`}>
              1
            </div>
            <div className={`w-24 h-1 ${step >= 2 ? 'bg-[#C8A962]' : 'bg-gray-300'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#C8A962] text-white' : 'bg-gray-300 text-gray-600'}`}>
              2
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6">
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A962]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A962]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A962]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <textarea
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A962]"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A962]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A962]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A962]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>
                  <p className="text-sm text-gray-600 mb-6">Card payment only (No Cash on Delivery)</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A962]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name on Card *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.cardName}
                        onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A962]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          value={formData.expiryDate}
                          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A962]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="123"
                          value={formData.cvv}
                          onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A962]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:border-[#C8A962] transition-colors font-semibold"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 bg-[#0B1D39] text-white py-3 rounded-lg hover:bg-[#C8A962] transition-colors font-semibold"
                >
                  {step === 1 ? 'Continue to Payment' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-lg p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.product?.images?.[0] || 'https://via.placeholder.com/60'}
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.product?.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    <p className="text-sm font-semibold">₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
