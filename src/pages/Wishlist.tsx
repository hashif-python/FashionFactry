import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface WishlistProps {
  onNavigate: (page: string, productId?: string) => void;
  onAddToCart: (productId: string, quantity: number) => void;
}

export const Wishlist = ({ onNavigate, onAddToCart }: WishlistProps) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlistItems();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchWishlistItems = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*, product:products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setWishlistItems(data as any);
    }
    setLoading(false);
  };

  const removeFromWishlist = async (itemId: string) => {
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', itemId);

    if (!error) {
      fetchWishlistItems();
    }
  };

  const moveToCart = async (productId: string, itemId: string) => {
    await onAddToCart(productId, 1);
    await removeFromWishlist(itemId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F3ED] flex items-center justify-center py-12">
        <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-sm max-w-md">
          <Heart className="w-16 h-16 text-[#C8A962] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">Your Wishlist</h2>
          <p className="text-[#2C2C2C]/70 mb-6">
            Save your favorite items for later
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-3 bg-[#C8A962] text-white rounded-xl hover:bg-[#C8A962] transition-colors font-medium"
          >
            Login to View
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[#2C2C2C]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3ED] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-[#C8A962]" />
          <h1 className="text-4xl font-bold text-[#2C2C2C]">My Wishlist</h1>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-2xl shadow-sm">
            <Heart className="w-16 h-16 text-[#C8A962]/30 mx-auto mb-4" />
            <p className="text-xl text-[#2C2C2C]/70 mb-4">Your wishlist is empty</p>
            <p className="text-[#2C2C2C]/60 mb-6">
              Start adding your favorite items
            </p>
            <button
              onClick={() => onNavigate('home')}
              className="px-6 py-3 bg-[#C8A962] text-white rounded-xl hover:bg-[#C8A962] transition-colors font-medium"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <button
                    onClick={() => onNavigate('product', item.product_id)}
                    className="w-full"
                  >
                    <img
                      src={item.product?.images?.[0] || 'https://via.placeholder.com/300'}
                      alt={item.product?.name}
                      className="w-full h-48 object-cover"
                    />
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Heart className="w-5 h-5 fill-current text-[#C8A962] hover:text-white" />
                  </button>
                </div>

                <div className="p-4">
                  <button
                    onClick={() => onNavigate('product', item.product_id)}
                    className="text-left w-full"
                  >
                    <h3 className="font-semibold text-[#2C2C2C] mb-2 hover:text-[#C8A962] transition-colors">
                      {item.product?.name}
                    </h3>
                  </button>
                  <p className="text-xl font-bold text-[#0B1D39] mb-4">
                    ₹{item.product?.price.toLocaleString()}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => moveToCart(item.product_id, item.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#C8A962] text-white rounded-xl hover:bg-[#C8A962] transition-colors text-sm font-medium"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="p-2 border border-[#D4CEB8] rounded-xl hover:border-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-[#2C2C2C] hover:text-red-500" />
                    </button>
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
