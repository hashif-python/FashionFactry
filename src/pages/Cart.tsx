import { useState, useEffect } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { protectedGet, protectedPost, protectedDelete } from "../lib/protectedApi";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

export const Cart = () => {
  const navigate = useNavigate();
  const { setCartCount } = useAuth();

  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ----------------------------------------------
      LOAD CART
  ---------------------------------------------- */
  const loadCart = async () => {
    const data = await protectedGet("cart/", navigate);
    if (data) {
      setCart(data);
      setCartCount(data.length);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCart();
  }, []);

  /* ----------------------------------------------
      UPDATE QUANTITY
  ---------------------------------------------- */
  const updateQuantity = async (cart_id: number, quantity: number) => {
    if (quantity < 1) return;

    await protectedPost(
      "cart/update/",
      { cart_id, quantity },
      navigate
    );

    toast.success("Quantity updated");

    // Update state locally
    const updated = cart.map((item) =>
      item.cart_id === cart_id ? { ...item, quantity } : item
    );

    setCart(updated);
  };

  /* ----------------------------------------------
      REMOVE ITEM
  ---------------------------------------------- */
  const removeItem = async (cart_id: number) => {
    await protectedDelete(`cart/remove/${cart_id}/`, navigate);

    toast.success("Item removed");

    const updated = cart.filter((item) => item.cart_id !== cart_id);
    setCart(updated);
    setCartCount(updated.length);
  };

  /* ----------------------------------------------
      EMPTY UI
  ---------------------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white px-4">
        <div className="text-center bg-white/10 p-10 rounded-xl max-w-sm">
          <p className="text-xl mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-[#C8A962] text-white rounded-lg"
          >
            Shop Now
          </button>
        </div>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => {
    const price = item.variant.final_price || item.variant.price;
    return sum + price * item.quantity;
  }, 0);

  /* ----------------------------------------------
      MAIN UI
  ---------------------------------------------- */
  return (
    <div className="min-h-screen py-8 px-4 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Your Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.cart_id}
                className="bg-white/10 p-4 rounded-xl flex gap-4"
              >
                {/* IMAGE */}
                <img
                  src={item.product.image}
                  className="w-28 h-28 object-cover rounded-lg"
                />

                {/* DETAILS */}
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{item.product.name}</h2>

                  <p className="text-gray-300 text-sm mt-1">
                    {item.variant.variant_type === "shoe" &&
                      `Size ${item.variant.size} • ${item.variant.color}`}
                    {item.variant.variant_type === "watch" &&
                      `${item.variant.strap_color} • ${item.variant.dial_size}`}
                    {item.variant.variant_type === "spectacle" &&
                      `${item.variant.frame_color} • ${item.variant.lens_power}`}
                  </p>

                  <p className="text-xl font-bold mt-2">
                    ₹{item.variant.final_price.toLocaleString()}
                  </p>

                  {/* QUANTITY */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => updateQuantity(item.cart_id, item.quantity - 1)}
                      className="p-2 bg-white text-black rounded-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="font-semibold">{item.quantity}</span>

                    <button
                      onClick={() => updateQuantity(item.cart_id, item.quantity + 1)}
                      className="p-2 bg-white text-black rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* REMOVE */}
                <button
                  onClick={() => removeItem(item.cart_id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="bg-white/10 p-6 rounded-xl h-fit">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

            <div className="flex justify-between text-lg">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full mt-6 px-6 py-3 bg-[#C8A962] text-white rounded-lg text-lg"
            >
              Checkout
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
