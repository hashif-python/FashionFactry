import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import {
  protectedPost,
} from "../lib/protectedApi";
import {
  Star,
  ShoppingCart,
  Plus,
  Minus,
  Package,
  Heart,
  HeartOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

function getWishlistCount(wl: any): number {
  if (!wl) return 0;
  if (Array.isArray(wl)) return wl.length;
  if (wl.items && Array.isArray(wl.items)) return wl.items.length;
  if (wl.wishlist_id) return 1;
  return 0;
}

function getCartCount(cart: any): number {
  if (!cart) return 0;
  if (Array.isArray(cart)) return cart.length;
  if (cart.items && Array.isArray(cart.items)) return cart.items.length;
  if (cart.cart_id) return 1;
  return 0;
}

export const ProductDetail = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const type = params.get("type"); // watch, shoe, spectacle

  const { setWishlistCount, setCartCount } = useAuth();
  const [variantImages, setVariantImages] = useState<string[]>([]);

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [reviews, setReviews] = useState<any[]>([]);
  const [me, setMe] = useState<any | null>(null);

  const [isWishlisted, setIsWishlisted] = useState(false);

  // Zoom
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  /* ------------------------------------
      FETCH PRODUCT DETAILS + REVIEWS
  ------------------------------------ */
  useEffect(() => {
    if (!id || !type) return;

    const loadProduct = async () => {

      try {
        const url = `products/${type}/${id}/`;
        const data = await apiFetch(url);
        if (data.variants?.length > 0) {
          setSelectedVariant(data.variants[0]);

          const imgs =
            data.variants[0].images?.map((i: any) => i.image_url) || [];

          setVariantImages(imgs);
          setSelectedImage(0);
        }


        setProduct(data);
        if (data.variants?.length > 0) {
          setSelectedVariant(data.variants[0]);
        }

        // Load reviews
        setReviews(data.reviews || []);

      } catch (err) {
        console.error("Product fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    const loadMe = async () => {
      try {
        const data = await apiFetch("me/");
        setMe(data);
      } catch { }
    };

    const loadWishlist = async () => {
      try {
        const list = await apiFetch("wishlist/");

        const exists = list.items?.some(
          (item: any) => item.product.id === Number(id)
        );

        setIsWishlisted(exists);
      } catch { }
    };

    loadProduct();
    loadMe();
    loadWishlist();
  }, [id, type]);

  /* ------------------------------------
      ADD / REMOVE WISHLIST
  ------------------------------------ */
  const toggleWishlist = async () => {
    if (!product) return;

    if (isWishlisted) {
      const res = await protectedPost(
        "wishlist/toggle/",
        { product_id: product.id },
        navigate
      );

      if (res) {
        toast.success("Removed from wishlist");
        setIsWishlisted(false);
        const wl = await apiFetch("wishlist/");
        setWishlistCount(getWishlistCount(wl));
      }
      return;
    }

    const res = await protectedPost(
      "wishlist/toggle/",
      { product_id: product.id, variant_id: selectedVariant.id },
      navigate
    );

    if (res) {
      toast.success("Added to wishlist");
      setIsWishlisted(true);

      const wl = await apiFetch("wishlist/");
      setWishlistCount(getWishlistCount(wl));

    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Product not found</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-[#C8A962] text-white rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const images =
    variantImages.length > 0
      ? variantImages
      : product.images?.map((img: any) => img.image_url) || [];
  const mainImage = images[selectedImage];

  const variants = product.variants || [];

  // ---------- SHOES DERIVED DATA ----------
  const shoeVariants = variants.filter((v: any) => v.variant_type === "shoe");

  // unique sizes
  const availableSizes = Array.from(
    new Set(shoeVariants.map((v: any) => v.size))
  );



  // variants matching selected size
  const sizeFilteredVariants = selectedVariant?.size
    ? shoeVariants.filter((v: any) => v.size === selectedVariant.size)
    : [];

  // unique colors for selected size
  const availableColors = Array.from(
    new Set(sizeFilteredVariants.map((v: any) => v.color))
  );


  const sizeStockMap: Record<string, number> = {};
  shoeVariants.forEach((v: any) => {
    sizeStockMap[v.size] = (sizeStockMap[v.size] || 0) + v.stock;
  });



  const handleVariantSelect = (v: any) => {
    setSelectedVariant(v);
    setQuantity(1);

    const imgs = v.images?.map((i: any) => i.image_url) || [];
    setVariantImages(imgs);
    setSelectedImage(0); // reset to first image
  };

  const handleSizeChange = (size: string) => {
    const firstVariant = shoeVariants.find((v: any) => v.size === size);
    if (firstVariant) {
      handleVariantSelect(firstVariant);
    }
  };



  const finalPrice =
    selectedVariant?.final_price || selectedVariant?.price || product.offer_price;

  const basePrice =
    selectedVariant?.price || product?.original_price || product?.price;

  const discount = selectedVariant?.discount_percent || product?.discount_percent;

  /* ZOOM CALCULATION */
  const handleZoomMove = (e: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
  };

  /* ------------------------------------
      ADD TO CART
  ------------------------------------ */
  const handleAddToCart = async () => {
    if (!selectedVariant) return toast.error("Select a variant");

    const res = await protectedPost(
      "cart/add/",
      { variant_id: selectedVariant.id, quantity },
      navigate
    );

    if (res) {
      toast.success("Added to cart");

      const cart = await apiFetch("cart/");
      setCartCount(getCartCount(cart));
    }
  };


  return (
    <div className="min-h-screen py-8 px-4 text-white">
      <button
        onClick={() => navigate(-1)}
        className="text-white/80 hover:text-[#C8A962] mb-6 flex items-center gap-2"
      >
        ← Back
      </button>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* ---------------- LEFT: IMAGES ---------------- */}
        <div>
          <div
            className="rounded-xl overflow-hidden bg-white/10 h-[420px] relative"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleZoomMove}
          >
            {/* Floating wishlist icon on image */}
            <button
              onClick={toggleWishlist}
              className="absolute top-4 right-4 bg-white/20 p-2 rounded-full backdrop-blur-sm"
            >
              {isWishlisted ? (
                <HeartOff className="text-red-500" />
              ) : (
                <Heart className="text-white" />
              )}
            </button>

            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-150"
              style={{
                transform: isZoomed ? "scale(1.7)" : "scale(1)",
                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
              }}
            />
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            {images.map((img: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`rounded-lg overflow-hidden border-2 ${selectedImage === index
                  ? "border-[#C8A962]"
                  : "border-white/20"
                  }`}
              >
                <img
                  src={img}
                  className="w-full h-20 object-cover"
                  alt="thumb"
                />
              </button>
            ))}
          </div>
        </div>

        {/* ---------------- RIGHT: DETAILS ---------------- */}
        <div className="bg-white/10 p-6 rounded-xl backdrop-blur">

          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${i < Math.round(product.rating)
                  ? "fill-[#C8A962] text-[#C8A962]"
                  : "text-gray-500"
                  }`}
              />
            ))}
            <span className="text-gray-300">({product.rating})</span>
          </div>

          {/* PRICE */}
          <div className="mb-6">
            <p className="text-4xl font-bold text-white">
              ₹{finalPrice?.toLocaleString()}
            </p>

            {discount > 0 && (
              <p className="text-sm text-gray-300 line-through mt-1">
                ₹{basePrice?.toLocaleString()}
              </p>
            )}
          </div>

          <p className="opacity-80 mb-6 whitespace-pre-line">
            {product.description}
          </p>

          {/* ---------------- VARIANTS ---------------- */}
          {/* ---------------- VARIANTS ---------------- */}
          {variants.length > 0 && (
            <div className="border-t border-gray-700 pt-6 mb-6">

              {/* ================= SHOES ================= */}
              {product.product_type === "shoe" && (
                <>
                  {/* SIZE DROPDOWN */}
                  <div className="mb-4">
                    <label className="block mb-2 font-semibold">
                      Select Size
                    </label>

                    <select
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20"
                      value={selectedVariant?.size || ""}
                      onChange={(e) => handleSizeChange(e.target.value)}
                    >
                      <option value="" disabled>
                        Choose size
                      </option>

                      {availableSizes.map((size: string) => {
                        const stock = sizeStockMap[size] || 0;
                        return (
                          <option key={size} value={size} disabled={stock === 0}>
                            EU {size} {stock === 0 ? "(Out of stock)" : `(In stock: ${stock})`}
                          </option>
                        );
                      })}
                    </select>

                  </div>

                  {/* COLOR OPTIONS */}
                  {availableColors.length > 0 && (
                    <div>
                      <label className="block mb-2 font-semibold">
                        Available Colors
                      </label>

                      <div className="flex flex-wrap gap-3">
                        {sizeFilteredVariants.map((v: any) => (
                          <button
                            key={v.id}
                            onClick={() => handleVariantSelect(v)}
                            disabled={v.stock === 0}
                            className={`px-4 py-2 rounded-lg border transition-all ${selectedVariant?.id === v.id
                              ? "border-[#C8A962] bg-[#C8A962]/20"
                              : "border-white/20 hover:border-[#C8A962]"
                              } ${v.stock === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                          >
                            {v.color} ({v.stock})
                          </button>
                        ))}
                      </div>

                    </div>
                  )}
                </>
              )}

              {/* ================= WATCH / SPECTACLE (UNCHANGED) ================= */}
              {product.product_type !== "shoe" && (
                <>
                  <h3 className="font-semibold mb-4">Select Variant</h3>

                  <div className="grid grid-cols-2 gap-3">
                    {variants.map((v: any) => (
                      <button
                        key={v.id}
                        onClick={() => handleVariantSelect(v)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${selectedVariant?.id === v.id
                          ? "border-[#C8A962] bg-[#C8A962]/10"
                          : "border-white/20 hover:border-[#C8A962]"
                          }`}
                      >
                        {v.variant_type === "watch" && (
                          <p className="font-semibold">
                            {v.strap_color} - {v.dial_size}
                          </p>
                        )}

                        {v.variant_type === "spectacle" && (
                          <p className="font-semibold">
                            {v.frame_color} - {v.box ? "With Box" : "Without Box"}
                          </p>
                        )}

                        <p className="text-xs text-gray-400 mt-1">
                          + ₹{v.price}
                        </p>
                        {selectedVariant && (
                          <p className="text-sm text-gray-400 mt-1">
                            {selectedVariant.stock > 0
                              ? `Only ${selectedVariant.stock} left in stock`
                              : "Out of stock"}
                          </p>
                        )}


                        <div className="flex items-center gap-1 text-xs mt-1 text-gray-400">
                          <Package className="w-3 h-3" />
                          {v.stock} in stock
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}


          {/* ---------------- QUANTITY ---------------- */}
          <div className="border-t border-gray-700 pt-6 mb-6">
            <h3 className="font-semibold mb-3">Quantity</h3>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 bg-white text-black rounded-lg"
              >
                <Minus className="w-5 h-5" />
              </button>

              <span className="text-xl font-semibold">{quantity}</span>

              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 bg-white text-black rounded-lg"
                disabled={
                  selectedVariant?.stock
                    ? quantity >= selectedVariant.stock
                    : false
                }
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ---------------- ACTION BUTTONS ---------------- */}
          <div className="flex gap-3 items-center">

            {/* ADD TO CART */}
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-[#C8A962] text-white py-4 rounded-lg flex items-center justify-center gap-3 mb-3"
            >
              <ShoppingCart className="w-6 h-6" />
              Add to Cart
            </button>

            {/* WISHLIST BUTTON */}
            <button
              onClick={toggleWishlist}
              className="mb-3 w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center"
            >
              {isWishlisted ? (
                <HeartOff className="text-red-500 w-7 h-7" />
              ) : (
                <Heart className="text-white w-7 h-7" />
              )}
            </button>
          </div>

          {/* BUY NOW */}
          <button
            onClick={() => {
              if (!selectedVariant) {
                toast.error("Select a variant");
                return;
              }

              navigate("/checkout/buy-now", {
                state: {
                  product,
                  variant: selectedVariant,
                  quantity,
                  type,
                },
              });
            }}
            className="w-full bg-white text-black py-4 rounded-lg border border-[#C8A962] font-semibold"
          >
            Buy Now
          </button>


        </div>
      </div>

      {/* ---------------- REVIEWS SECTION ---------------- */}
      <div className="mt-12 bg-white/5 p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

        {reviews.length === 0 ? (
          <p className="text-white/70">No reviews yet</p>
        ) : (
          reviews.map((rev: any) => (
            <div
              key={rev.id}
              className="border-b border-white/10 pb-4 mb-4 flex gap-4"
            >
              {/* User Avatar */}
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg">
                {rev.user.first_name
                  ? rev.user.first_name.charAt(0)
                  : rev.user.mobile.charAt(0)}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">
                    {rev.user.first_name || rev.user.mobile}
                  </p>

                  {me && rev.user.id === me.id && (
                    <span className="text-yellow-400 text-sm">(You)</span>
                  )}
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`text-lg ${s <= rev.rating
                        ? "text-yellow-400"
                        : "text-gray-600"
                        }`}
                    >
                      ★
                    </span>
                  ))}
                </div>

                <p className="text-white/80 mb-2">{rev.comment}</p>

                {rev.image && (
                  <img
                    src={rev.image}
                    className="w-28 h-28 rounded-lg object-cover mb-2"
                  />
                )}

                <p className="text-xs text-white/50">
                  {new Date(rev.created_at).toLocaleString()}
                </p>

                {/* Edit option if user submitted review */}
                {me && rev.user.id === me.id && (
                  <button
                    onClick={() =>
                      navigate(`/review/edit/${rev.id}?product=${product.id}`)
                    }
                    className="text-sm text-[#C8A962] mt-2 underline"
                  >
                    Edit Review
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
