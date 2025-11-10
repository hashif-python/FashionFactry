import { useState, useEffect } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, CartItem, Product } from '../lib/supabase';

interface CartProps {
  onNavigate: (page: string) => void;
}

export const Cart = ({ onNavigate }: CartProps) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<(CartItem & { product: Product })[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*), variant:product_variants(*)')
      .eq('user_id', user.id);

    if (!error && data) {
      setCartItems(data as any);
    }
    setLoading(false);
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', itemId);

    if (!error) {
      fetchCartItems();
    }
  };

  const removeItem = async (itemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (!error) {
      fetchCartItems();
    }
  };

  const applyCoupon = async () => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .gte('valid_until', new Date().toISOString())
      .maybeSingle();

    if (error || !data) {
      setCouponMessage('Invalid or expired coupon code');
      setDiscount(0);
      return;
    }

    setDiscount(data.discount_percent);
    setCouponMessage(`Coupon applied! ${data.discount_percent}% off`);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <p className="text-xl text-white/80 mb-4">Please login to view your cart</p>
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

  const subtotal = cartItems.reduce((sum, item) => {
    const basePrice = item.product?.price || 0;
    const variantPrice = item.variant?.price_modifier || 0;
    return sum + (basePrice + variantPrice) * item.quantity;
  }, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const getVariantDisplayText = (item: any) => {
    if (!item.variant) return null;
    const attrs = item.variant.attributes;
    const parts = [];
    if (attrs.size) parts.push(`Size ${attrs.size}`);
    if (attrs.color) parts.push(attrs.color);
    if (attrs.material) parts.push(attrs.material);
    return parts.join(' - ');
  };

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-lg">
            <p className="text-xl text-white/80 mb-4">Your cart is empty</p>
            <button
              onClick={() => onNavigate('home')}
              className="px-6 py-2 bg-[#C8A962] text-white rounded-lg hover:bg-[#C8A962] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex gap-4">
                  <img
                    src={item.product?.images?.[0] || 'https://via.placeholder.com/150'}
                    alt={item.product?.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{item.product?.name}</h3>
                    {getVariantDisplayText(item) && (
                      <p className="text-sm text-white/80 mb-1">{getVariantDisplayText(item)}</p>
                    )}
                    <p className="text-lg font-bold text-white">
                      ₹{((item.product?.price || 0) + (item.variant?.price_modifier || 0)).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 border border-gray-300 rounded hover:border-[#C8A962]"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 border border-gray-300 rounded hover:border-[#C8A962]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 h-fit">
              <h2 className="text-2xl font-bold text-white mb-4">Order Summary</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Apply Coupon
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A962]"
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2 bg-[#C8A962] text-white rounded-lg hover:bg-[#C8A962] transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-sm mt-2 ${discount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {couponMessage}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-white/80">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}%)</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-white pt-2 border-t">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('checkout')}
                className="w-full mt-6 bg-[#C8A962] text-white py-3 rounded-lg hover:bg-[#C8A962] transition-colors font-semibold"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
