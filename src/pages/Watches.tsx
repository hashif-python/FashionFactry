import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import { ProductCard } from "../components/ProductCard";
import { useNavigate } from "react-router-dom";

export const Watches = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState("new");
  const [selectedGender, setSelectedGender] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await apiGet("products/watches/");
      setProducts(data);
    } catch (err) {
      console.error("Error loading watches:", err);
    }
    setLoading(false);
  };

  // Fake cart handler (add real cart system later)
  const handleAddToCart = (id: number) => {
    console.log("Added to cart:", id);
  };

  const handleProductClick = (id: number) => {
    navigate(`/product/${id}?type=watch`);
  };

  const processProducts = () => {
    let result = [...products];

    if (selectedGender !== "all") {
      result = result.filter((p) => p.gender === selectedGender);
    }

    return result;
  };

  const filtered = processProducts();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen py-8 text-white">
      <div className="max-w-7xl mx-auto px-4">

        <h1 className="text-4xl font-bold mb-6">Watches</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {["all", "men", "women"].map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGender(g)}
              className={`px-6 py-2 rounded-xl 
              ${selectedGender === g ? "bg-[#C8A962]" : "bg-white/20"}`}
            >
              {g === "all" ? "All" : g[0].toUpperCase() + g.slice(1)}
            </button>
          ))}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="ml-auto px-4 py-2 bg-white/10 rounded-xl text-white"
          >
            <option value="new">Newest</option>
            <option value="best">Best Seller</option>
            <option value="price-low">Price Low → High</option>
            <option value="price-high">Price High → Low</option>
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-white/70 mt-12">
            No products found.
          </p>
        )}
      </div>
    </div>
  );
};
