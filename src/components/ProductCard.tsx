import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../lib/supabase';

interface ProductCardProps {
  product: Product;
  onProductClick: (id: string) => void;
  onAddToCart: (id: string) => void;
}

export const ProductCard = ({ product, onProductClick, onAddToCart }: ProductCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
      <div
        onClick={() => onProductClick(product.id)}
        className="relative overflow-hidden bg-gray-100"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {product.is_best_seller && (
          <span className="absolute top-2 right-2 bg-[#C8A962] text-white px-3 py-1 rounded-full text-xs font-bold">
            Best Seller
          </span>
        )}
      </div>

      <div className="p-4">
        <h3
          onClick={() => onProductClick(product.id)}
          className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-[#C8A962]"
        >
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.round(product.rating)
                  ? 'fill-[#C8A962] text-[#C8A962]'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-1">({product.rating})</span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product.id);
            }}
            className="bg-[#0B1D39] text-white p-2 rounded-lg hover:bg-[#C8A962] transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
