import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../lib/supabase';

interface ProductCardProps {
  product: Product;
  onProductClick: (id: string) => void;
  onAddToCart: (id: string) => void;
}

export const ProductCard = ({ product, onProductClick, onAddToCart }: ProductCardProps) => {
  // Try to detect discount: supports optional fields like mrp/compare_price/compareAtPrice
  const mrp =
    (product as any).mrp ??
    (product as any).compare_price ??
    (product as any).compareAtPrice ??
    undefined;

  const hasDiscount = typeof mrp === 'number' && mrp > product.price;

  const img = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : 'https://via.placeholder.com/600x600?text=No+Image';

  return (
    <div
      className="
        rounded-2xl border border-white/10 bg-black/40 backdrop-blur
        hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]
        transition-all duration-300 hover:-translate-y-1 cursor-pointer
      "
      onClick={() => onProductClick(product.id)}
    >
      {/* Image */}
      <div className="relative p-2">
        <div className="overflow-hidden rounded-2xl bg-[#0b0b0b]">
          <img
            src={img}
            alt={product.name}
            className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {(hasDiscount || (product as any).is_on_sale) && (
          <span
            className="
              absolute bottom-3 left-4 rounded-full
              bg-white/10 text-white px-3 py-1 text-xs font-semibold
              border border-white/20
            "
          >
            Sale
          </span>
        )}
      </div>

      {/* Content */}
      <div className="px-3 pb-4">
        {/* Title */}
        <h3
          className="
            mt-1 text-white font-semibold tracking-wide uppercase
            text-sm sm:text-base line-clamp-2
            hover:text-[#C8A962] transition-colors
          "
        >
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < Math.round(product.rating)
                ? 'fill-[#C8A962] text-[#C8A962]'
                : 'text-white/20'
                }`}
            />
          ))}
          <span className="text-xs text-white/60 ml-1">({product.rating})</span>
        </div>

        {/* Price + Cart */}
        <div className="mt-2 flex items-end justify-between">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-xs text-white/50 line-through">
                ₹{(mrp as number).toLocaleString()}
              </span>
            )}
            <span className="text-lg sm:text-xl font-bold text-white">
              ₹{product.price.toLocaleString()}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product.id);
            }}
            className="
              inline-flex items-center justify-center
              h-10 w-10 rounded-xl
              bg-white text-black
              hover:bg-[#C8A962] hover:text-white
              transition-colors
            "
            aria-label="Add to cart"
            title="Add to cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
