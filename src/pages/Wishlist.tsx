import { useEffect, useState } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { protectedGet, protectedPost } from "../lib/protectedApi";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { apiFetch } from "../lib/api";

function getCartCount(cart: any): number {
  if (!cart) return 0;
  if (Array.isArray(cart)) return cart.length;
  if (cart.items && Array.isArray(cart.items)) return cart.items.length;
  if (cart.cart_id) return 1;
  return 0;
}

export const Wishlist = () => {
  const navigate = useNavigate();
  const { setWishlistCount, setCartCount } = useAuth();

  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ----------------------------------------------
      LOAD WISHLIST
  ---------------------------------------------- */
  const loadWishlist = async () => {
    const data = await protectedGet("wishlist/", navigate);
    if (data) {
      setWishlist(data);
      setWishlistCount(data.length);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  /* ----------------------------------------------
      REMOVE FROM WISHLIST
  ---------------------------------------------- */
  const handleRemove = async (product_id: number, variant_id?: number) => {
    const res = await protectedPost(
      "wishlist/toggle/",
      { product_id, variant_id },
      navigate
    );

    if (!res) return;

    toast.success("Removed from wishlist");

    const updatedList = wishlist.filter(
      (item) =>
        !(
          item.product.id === product_id &&
          (item.variant?.id ?? null) === (variant_id ?? null)
        )
    );

    setWishlist(updatedList);
    setWishlistCount(updatedList.length);
  };

  /* ----------------------------------------------
      ADD TO CART
  ---------------------------------------------- */
  const handleAddToCart = async (variant_id: number) => {
    const res = await protectedPost(
      "cart/add/",
      { variant_id, quantity: 1 },
      navigate
    );

    if (!res) return;

    toast.success("Added to cart");
    const cart = await apiFetch("cart/");
    setCartCount(getCartCount(cart));
  };

  /* ----------------------------------------------
      LOADING UI
  ---------------------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  /* ----------------------------------------------
      EMPTY UI
  ---------------------------------------------- */
  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white px-4">
        <div className="text-center bg-white/10 p-10 rounded-xl max-w-sm">
          <Heart className="w-14 h-14 text-[#C8A962] mx-auto mb-4" />
          <p className="text-xl mb-4">Your wishlist is empty</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-[#C8A962] text-white rounded-lg"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------
      MAIN UI
  ---------------------------------------------- */
  return (
    <div className="min-h-screen py-8 px-4 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My Wishlist</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {wishlist.map((item) => (
            <div
              key={item.wishlist_id}
              className="bg-white/10 p-4 rounded-xl relative hover:bg-white/20 transition"
            >
              {/* IMAGE CONTAINER */}
              <button
                className="w-full block"
                onClick={() =>
                  navigate(
                    `/product/${item.product.id}?type=${item.product.product_type}`
                  )
                }
              >
                <div className="w-full h-40 md:h-48 rounded-lg overflow-hidden bg-white/5">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </button>

              {/* REMOVE BUTTON */}
              <button
                onClick={() =>
                  handleRemove(item.product.id, item.variant?.id)
                }
                className="absolute top-3 right-3 bg-white p-2 rounded-full hover:bg-gray-200"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>

              {/* TITLE */}
              <h2 className="mt-4 font-semibold">{item.product.name}</h2>

              {/* VARIANT DETAILS */}
              {item.variant && (
                <p className="text-sm text-gray-300 mt-1">
                  {item.variant.variant_type === "shoe" &&
                    `Size ${item.variant.size} • ${item.variant.color}`}
                  {item.variant.variant_type === "watch" &&
                    `${item.variant.strap_color} • ${item.variant.dial_size}`}
                  {item.variant.variant_type === "spectacle" &&
                    `${item.variant.frame_color} • ${item.variant.lens_power}`}
                </p>
              )}

              {/* PRICE */}
              <p className="text-xl font-bold mt-2">
                ₹
                {(item.variant?.final_price ??
                  item.product.offer_price ??
                  item.product.price)?.toLocaleString()}
              </p>

              {/* ADD TO CART BUTTON */}
              <button
                onClick={() => handleAddToCart(item.variant?.id)}
                className="w-full mt-4 bg-[#C8A962] text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#b79555]"
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
};
