import { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { supabase, Product } from '../lib/supabase';

interface WatchesProps {
  onNavigate: (page: string, productId?: string) => void;
  onAddToCart: (productId: string) => void;
}

export const Watches = ({ onNavigate, onAddToCart }: WatchesProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedGender, setSelectedGender] = useState<'all' | 'men' | 'women'>('all');
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'new' | 'best'>('new');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedGender, sortBy]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories!inner(slug)')
      .eq('categories.slug', 'watches');

    if (!error && data) {
      setProducts(data as unknown as Product[]);
    }
    setLoading(false);
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    if (selectedGender !== 'all') {
      filtered = filtered.filter((p) => p.gender === selectedGender);
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'best':
        filtered.sort((a, b) => (b.is_best_seller ? 1 : 0) - (a.is_best_seller ? 1 : 0));
        break;
      case 'new':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    setFilteredProducts(filtered);
  };

  const bestSellers = products.filter((p) => p.is_best_seller).slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Watches</h1>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setSelectedGender('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              selectedGender === 'all'
                ? 'bg-[#0B1D39] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedGender('men')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              selectedGender === 'men'
                ? 'bg-[#0B1D39] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Men
          </button>
          <button
            onClick={() => setSelectedGender('women')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              selectedGender === 'women'
                ? 'bg-[#0B1D39] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Women
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="ml-auto px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A962]"
          >
            <option value="new">New Arrivals</option>
            <option value="best">Best Sellers</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {bestSellers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Sellers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onProductClick={(id) => onNavigate('product', id)}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mb-4">All Watches</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <p className="text-gray-600 text-lg">No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
