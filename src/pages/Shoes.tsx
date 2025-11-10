import { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { supabase, Product } from '../lib/supabase';

interface ShoesProps {
  onNavigate: (page: string, productId?: string) => void;
  onAddToCart: (productId: string) => void;
}

export const Shoes = ({ onNavigate, onAddToCart }: ShoesProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedGender, setSelectedGender] = useState<'all' | 'men' | 'women'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedGender]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories!inner(slug)')
      .eq('categories.slug', 'shoes');

    if (!error && data) {
      setProducts(data as unknown as Product[]);
    }
    setLoading(false);
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (selectedGender !== 'all') {
      filtered = filtered.filter((p) => p.gender === selectedGender);
    }

    setFilteredProducts(filtered);
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
        <h1 className="text-4xl font-bold text-white mb-8">Shoes</h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSelectedGender('all')}
            className={`px-6 py-2 rounded-xl font-semibold transition-colors ${
              selectedGender === 'all'
                ? 'bg-[#C8A962] text-white'
                : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedGender('men')}
            className={`px-6 py-2 rounded-xl font-semibold transition-colors ${
              selectedGender === 'men'
                ? 'bg-[#C8A962] text-white'
                : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
            }`}
          >
            Men
          </button>
          <button
            onClick={() => setSelectedGender('women')}
            className={`px-6 py-2 rounded-xl font-semibold transition-colors ${
              selectedGender === 'women'
                ? 'bg-[#C8A962] text-white'
                : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
            }`}
          >
            Women
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onProductClick={(id) => onNavigate('product', id)}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-white/70">No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
