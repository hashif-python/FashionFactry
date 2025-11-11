import { useState, useEffect } from 'react';
import { Star, ShoppingCart, Plus, Minus, Package } from 'lucide-react';
import { supabase, Product, ProductVariant } from '../lib/supabase';

interface ProductDetailProps {
  productId: string;
  onNavigate: (page: string) => void;
  onAddToCart: (productId: string, quantity: number, variantId?: string) => void;
}

export const ProductDetail = ({ productId, onNavigate, onAddToCart }: ProductDetailProps) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // zoom state
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  useEffect(() => {
    fetchProduct();
    fetchVariants();
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

  const fetchVariants = async () => {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId);

    if (!error && data && data.length > 0) {
      setVariants(data as ProductVariant[]);
      setSelectedVariant(data[0] as ProductVariant);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-white/80">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-white/80 mb-4">Product not found</p>
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-2 bg-[#C8A962] text-white rounded-lg hover:bg-[#C8A962] transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [];
  // Ensure at least 4 thumbnails by repeating images if needed
  const thumbImages =
    images.length >= 4 ? images : [...images, ...images, ...images].slice(0, Math.max(4, images.length));

  const mainImage = images[selectedImage] || 'https://via.placeholder.com/1200x900?text=No+Image';
  const finalPrice = product.price + (selectedVariant?.price_modifier || 0);

  const handleAddToCart = () => {
    if (variants.length > 0 && !selectedVariant) return;
    onAddToCart(product.id, quantity, selectedVariant?.id);
  };

  const handleBuyNow = () => {
    // add to cart then go to checkout
    handleAddToCart();
    onNavigate('checkout');
  };

  const getVariantDisplayText = (variant: ProductVariant) => {
    const attrs = variant.attributes || ({} as any);
    const parts: string[] = [];
    if (attrs.size) parts.push(`Size ${attrs.size}`);
    if (attrs.color) parts.push(attrs.color);
    if (attrs.material) parts.push(attrs.material);
    return parts.join(' - ') || variant.name;
  };

  // track mouse position for zoom origin
  const onMainImageMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
  };

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('home')}
          className="text-white/80 hover:text-[#C8A962] mb-6 flex items-center gap-2"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Gallery */}
          <div>
            {/* Main image with hover zoom */}
            <div
              className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden mb-4 relative"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={onMainImageMove}
            >
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-96 object-cover transition-transform duration-200 ease-out"
                style={{
                  transform: isZoomed ? 'scale(1.6)' : 'scale(1)',
                  transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                  willChange: 'transform',
                }}
              />
            </div>

            {/* Thumbnails */}
            {thumbImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {thumbImages.map((image: string, index: number) => {
                  // map index back to actual images index if duplicated
                  const realIndex = index % (images.length || 1);
                  return (
                    <button
                      key={`${image}-${index}`}
                      onClick={() => setSelectedImage(realIndex)}
                      className={`rounded-lg overflow-hidden border-2 ${selectedImage === realIndex ? 'border-[#C8A962]' : 'border-gray-200'
                        }`}
                      title={`View ${product.name} ${realIndex + 1}`}
                    >
                      <img src={image} alt={`${product.name} ${realIndex + 1}`} className="w-full h-20 object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.round(product.rating) ? 'fill-[#C8A962] text-[#C8A962]' : 'text-gray-300'
                    }`}
                />
              ))}
              <span className="text-white/80">({product.rating} / 5)</span>
            </div>

            <div className="mb-6">
              <p className="text-4xl font-bold text-white">₹{finalPrice.toLocaleString()}</p>
              {selectedVariant && selectedVariant.price_modifier !== 0 && (
                <p className="text-sm text-white/80 mt-1">
                  Base price: ₹{product.price.toLocaleString()} + ₹
                  {selectedVariant.price_modifier.toLocaleString()}
                </p>
              )}
            </div>

            <p className="text-white/80 mb-6">{product.description}</p>

            {variants.length > 0 && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="font-semibold text-white mb-4">Select Variant</h3>
                <div className="grid grid-cols-2 gap-3">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 border-2 rounded-lg text-left transition-all ${selectedVariant?.id === variant.id
                          ? 'border-[#C8A962] bg-[#C8A962] bg-opacity-10'
                          : 'border-gray-200 hover:border-[#C8A962]'
                        }`}
                    >
                      <div className="font-medium text-sm text-white">{getVariantDisplayText(variant)}</div>
                      {variant.price_modifier !== 0 && (
                        <div className="text-xs text-white/80 mt-1">+₹{variant.price_modifier}</div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Package className="w-3 h-3" />
                        {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="font-semibold text-white mb-4">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:border-[#C8A962] transition-colors"
                >
                  <Minus className="w-5 h-5 text-[#1f2937]" />
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:border-[#C8A962] transition-colors"
                  disabled={selectedVariant ? quantity >= selectedVariant.stock : false}
                >
                  <Plus className="w-5 h-5 text-[#1f2937]" />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={variants.length > 0 && (!selectedVariant || selectedVariant.stock === 0)}
                className="w-full bg-[#C8A962] text-white py-4 rounded-lg hover:bg-[#C8A962] transition-colors flex items-center justify-center gap-2 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-6 h-6" />
                {variants.length > 0 && selectedVariant?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={variants.length > 0 && (!selectedVariant || selectedVariant.stock === 0)}
                className="w-full bg-white text-[#1A3A35] py-4 rounded-lg hover:bg-[#F5F3ED] transition-colors font-semibold text-lg border border-[#C8A962] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>

            <div className="mt-6 p-4 bg-transparent rounded-lg">
              <h4 className="font-semibold text-white mb-2">Delivery & Returns</h4>
              <ul className="text-sm text-white/80 space-y-1">
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
