import { useState, useEffect } from 'react';
import { Star, ShoppingCart, Plus, Minus } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';

interface ProductDetailProps {
  productId: string;
  onNavigate: (page: string) => void;
  onAddToCart: (productId: string, quantity: number) => void;
}

export const ProductDetail = ({ productId, onNavigate, onAddToCart }: ProductDetailProps) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (!error && data) {
      setProduct(data as Product);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Product not found</p>
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-2 bg-[#0B1D39] text-white rounded-lg hover:bg-[#C8A962] transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('home')}
          className="text-gray-600 hover:text-[#C8A962] mb-6 flex items-center gap-2"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-lg overflow-hidden mb-4">
              <img
                src={images[selectedImage] || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-[#C8A962]' : 'border-gray-200'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(product.rating)
                      ? 'fill-[#C8A962] text-[#C8A962]'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-gray-600">({product.rating} / 5)</span>
            </div>

            <p className="text-4xl font-bold text-gray-900 mb-6">₹{product.price.toLocaleString()}</p>

            <p className="text-gray-600 mb-6">{product.description}</p>

            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-gray-300 rounded-lg hover:border-[#C8A962] transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 border border-gray-300 rounded-lg hover:border-[#C8A962] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <button
              onClick={() => onAddToCart(product.id, quantity)}
              className="w-full bg-[#0B1D39] text-white py-4 rounded-lg hover:bg-[#C8A962] transition-colors flex items-center justify-center gap-2 font-semibold text-lg"
            >
              <ShoppingCart className="w-6 h-6" />
              Add to Cart
            </button>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Delivery & Returns</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Free shipping on orders over ₹2,000</li>
                <li>• Delivery in 3-5 business days</li>
                <li>• 30-day return policy</li>
                <li>• Card payment only (no COD)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
