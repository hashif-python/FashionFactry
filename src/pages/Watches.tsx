import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import { ProductCard } from "../components/ProductCard";
import { useNavigate } from "react-router-dom";

export const Watches = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedGender, setSelectedGender] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadProducts(selectedGender);
  }, [selectedGender, sortBy, page]);

  const loadProducts = async (gender: string) => {
    setLoading(true);

    try {
      let base =
        gender === "all"
          ? `products/watches/`
          : `products/search/gender/?gender=${gender}&type=watch`;

      const url = `${base}${base.includes("?") ? "&" : "?"}page=${page}`;
      const data = await apiGet(url);

      let formatted = Array.isArray(data) ? data : data?.results || [];
      formatted = sortProducts(formatted);

      setProducts((prev) =>
        page === 1 ? formatted : [...prev, ...formatted]
      );

      setHasMore(Boolean(data?.next));
    } catch (err) {
      console.error("Error loading watches:", err);
      setProducts([]);
      setHasMore(false);
    }

    setLoading(false);
  };

  const sortProducts = (items: any[]) => {
    switch (sortBy) {
      case "low-high":
        return [...items].sort(
          (a, b) =>
            (a.offer_price || a.original_price) -
            (b.offer_price || b.original_price)
        );
      case "high-low":
        return [...items].sort(
          (a, b) =>
            (b.offer_price || b.original_price) -
            (a.offer_price || a.original_price)
        );
      case "rating":
        return [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return items;
    }
  };

  const handleGenderChange = (g: string) => {
    setSelectedGender(g);
    setPage(1);
  };

  const handleProductClick = (id: number) => {
    navigate(`/product/${id}?type=watch`);
  };

  return (
    <div className="min-h-screen py-4 sm:py-8 text-white page-content">
      <div className="max-w-7xl mx-auto px-4">

        <h1 className="text-3xl sm:text-4xl font-bold mb-6">Watches</h1>

        {/* FILTER ROW */}
        <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 items-center justify-between">

          {/* Gender */}
          <div className="flex gap-2 sm:gap-3">
            {["all", "men", "women", "unisex"].map((g) => (
              <button
                key={g}
                onClick={() => handleGenderChange(g)}
                className={`px-4 py-2 rounded-xl ${selectedGender === g ? "bg-[#C8A962]" : "bg-white/20"
                  }`}
              >
                {g === "all" ? "All" : g.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-white/10 text-white px-4 py-2 pr-10 rounded-xl border border-white/20"
            >
              <option className="text-black" value="latest">Latest</option>
              <option className="text-black" value="low-high">Price: Low → High</option>
              <option className="text-black" value="high-low">Price: High → Low</option>
              <option className="text-black" value="rating">Rating</option>
            </select>

            <svg className="w-5 h-5 text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none" stroke="currentColor" strokeWidth="2"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onProductClick={handleProductClick}
            />
          ))}
        </div>

        {/* LOAD MORE */}
        {hasMore && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="px-8 py-3 bg-[#C8A962] text-black rounded-xl font-bold"
            >
              Load More
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
