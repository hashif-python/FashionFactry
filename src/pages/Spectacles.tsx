import { useState, useEffect } from "react";
import { ProductCard } from "../components/ProductCard";
import { apiGet } from "../lib/api";

interface SpectaclesProps {
  onNavigate: (page: string, productId?: number) => void;
  onAddToCart: (productId: number) => void;
}

export const Spectacles = ({ onNavigate, onAddToCart }: SpectaclesProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpectacles();
  }, []);

  const fetchSpectacles = async () => {
    try {
      const data = await apiGet("products/spectacles/");
      // Your Django URL pattern: products/?type=spectacle
      setProducts(data || []);
    } catch (err: any) {
      console.error("Failed to fetch spectacles:", err.message);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <h1 className="text-4xl font-bold text-white mb-8">Spectacles</h1>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onProductClick={(id) => onNavigate("product", id)}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        {/* No Products */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-white/70">No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
