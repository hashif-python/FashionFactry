import { useState, useEffect } from "react";
import { ProductCard } from "../components/ProductCard";
import { apiGet } from "../lib/api";
import { useNavigate } from "react-router-dom";

export const Spectacles = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchSpectacles();
  }, []);

  const fetchSpectacles = async () => {
    try {
      const data = await apiGet("products/spectacles/");
      setProducts(data || []);
    } catch (err: any) {
      console.error("Failed to fetch spectacles:", err);
    }
    setLoading(false);
  };

  const handleAddToCart = (id: number) => {
    console.log("Add to cart:", id);
  };

  const handleProductClick = (id: number) => {
    navigate(`/product/${id}?type=spectacles`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <h1 className="text-4xl font-bold mb-8">Spectacles</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
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
