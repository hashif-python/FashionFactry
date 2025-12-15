import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiGet } from "../lib/api";
import { Search as SearchIcon } from "lucide-react";

export const Search = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const query = params.get("q") || "";

    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query.trim().length > 0) {
            fetchResults();
        }
    }, [query]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const res = await apiGet(`/products/search/?q=${query}`);
            setResults(res.results || []);
        } catch (err) {
            console.error("Search error:", err);
        }
        setLoading(false);
    };

    const goToDetail = (item: any) => {
        const type = item.product_type; // watch, shoe, spectacle

        navigate(`/product/${type}/${item.id}`);
    };

    return (
        <div className="min-h-screen py-6 px-4 text-white">
            <div className="max-w-6xl mx-auto">

                {/* SEARCH HEADER */}
                <div className="flex items-center gap-3 mb-6">
                    <SearchIcon className="w-6 h-6 text-white" />
                    <h1 className="text-2xl font-bold">Search results for: {query}</h1>
                </div>

                {/* LOADING */}
                {loading && (
                    <div className="text-center text-white/70 text-lg">Searching...</div>
                )}

                {/* EMPTY STATE */}
                {!loading && results.length === 0 && (
                    <div className="text-center text-white/60 text-lg mt-10">
                        No products found.
                    </div>
                )}

                {/* RESULTS GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {results.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white/10 rounded-xl p-3 cursor-pointer hover:scale-105 transition"
                            onClick={() => goToDetail(item)}
                        >
                            <img
                                src={item.image || "/no-image.png"}
                                className="w-full h-40 object-cover rounded-lg"
                            />

                            <h2 className="mt-3 text-sm font-semibold">{item.name}</h2>

                            <div className="text-sm text-white/70 mt-1">
                                ⭐ {item.rating || 0}
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                                {item.offer_price ? (
                                    <>
                                        <span className="text-[#C8A962] font-bold">
                                            ₹{item.offer_price}
                                        </span>
                                        {item.original_price && (
                                            <span className="line-through text-white/50 text-sm">
                                                ₹{item.original_price}
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <span className="text-white/60 text-sm">No price</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};
