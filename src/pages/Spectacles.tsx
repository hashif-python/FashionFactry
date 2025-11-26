import { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';

interface SpectaclesProps {
  onNavigate: (page: string, productId?: string) => void;
  onAddToCart: (productId: string) => void;
}

export const Spectacles = ({ onNavigate, onAddToCart }: SpectaclesProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories!inner(slug)')
      .eq('categories.slug', 'spectacles');

    if (!error && data) {
      setProducts(data as unknown as Product[]);
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
        <h1 className="text-4xl font-bold text-white mb-8">Spectacles</h1>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onProductClick={(id) => onNavigate('product', id)}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-white/70">No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
