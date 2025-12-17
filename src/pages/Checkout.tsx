import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { protectedGet, protectedPost } from "../lib/protectedApi";

/* Cashfree global */
declare global {
  interface Window {
    Cashfree: any;
  }
}

export const Checkout = () => {
  const navigate = useNavigate();
  const { user, setCartCount } = useAuth();


  // ---------------- COUPON ----------------
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState<number | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);


  /* -----------------------------
        STATE
  ----------------------------- */
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: "",
    phone: "",
    address_line: "",
    city: "",
    state: "",
    pincode: "",
  });


  const [paymentMethod, setPaymentMethod] = useState("online");
  const [walletBalance, setWalletBalance] = useState(0);

  const [step, setStep] = useState(1);
  const [orderNumber, setOrderNumber] = useState("");

  /* -----------------------------
        LOAD CART & ADDRESSES
  ----------------------------- */
  useEffect(() => {
    if (user) {
      loadCart();
      loadAddresses();
      loadWallet();
    }
  }, [user]);

  const loadCart = async () => {
    const data = await protectedGet("cart/", navigate);
    if (data) {
      setCartItems(data);
      setCartCount(data.length);
    }
    setLoading(false);
  };

  const loadAddresses = async () => {
    const data = await protectedGet("address/", navigate);
    if (data) {
      setAddresses(data);
      const def = data.find((a: any) => a.is_default);
      setSelectedAddress(def || null);
    }
  };

  const loadWallet = async () => {
    const data = await protectedGet("wallet/", navigate);
    if (data) setWalletBalance(Number(data.balance));
  };

  const applyCoupon = async () => {
    if (!coupon.trim()) {
      toast.error("Enter a coupon code");
      return;
    }

    setApplyingCoupon(true);

    try {
      const res = await protectedPost(
        "cart/apply-coupon/",
        { code: coupon },
        navigate
      );

      setDiscount(res.discount);
      setFinalTotal(res.final_total);

      toast.success("Coupon applied");
    } catch (err: any) {
      setDiscount(0);
      setFinalTotal(null);
      toast.error(err?.message || "Invalid coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };


  /* -----------------------------
        ADD NEW ADDRESS
  ----------------------------- */
  const handleAddAddress = async (e: any) => {
    e.preventDefault();
    const res = await protectedPost("address/", newAddressForm, navigate);

    if (res) {
      toast.success("Address added successfully");
      setNewAddressForm({
        full_name: "",
        phone: "",
        pincode: "",
        address_line: "",
        city: "",
        state: "",
        is_default: false,
      });

      setAddressModalOpen(false);
      loadAddresses();
    }
  };

  /* -----------------------------
        CALCULATE TOTAL
  ----------------------------- */
  const total = cartItems.reduce(
    (sum, item) =>
      sum +
      (item.variant.final_price || item.variant.price) * item.quantity,
    0
  );

  const payableTotal = finalTotal !== null ? finalTotal : total;


  /* -----------------------------
        HANDLE CHECKOUT
  ----------------------------- */
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      /* -------------------------
          WALLET PAYMENT
      -------------------------- */
      if (paymentMethod === "wallet") {
        const res = await protectedPost(
          "checkout/",
          { address_id: selectedAddress.id, payment_method: "wallet", coupon_code: coupon || null, },
          navigate
        );

        if (!res) return;

        toast.success("Order placed with wallet");
        setOrderNumber(res.order_id);
        setStep(3);
        return;
      }

      /* -------------------------
          ONLINE PAYMENT (CASHFREE)
      -------------------------- */

      // Step 1 → Create backend order
      const checkoutRes = await protectedPost(
        "checkout/",
        { address_id: selectedAddress.id, payment_method: "online", coupon_code: coupon || null, },
        navigate
      );

      if (!checkoutRes) return;
      const backendOrderId = checkoutRes.order_id;

      // Step 2 → Create Cashfree order
      const cfRes = await protectedPost(
        "payment/initiate/",
        { order_id: backendOrderId },
        navigate
      );

      if (!cfRes) {
        toast.error("Failed to initiate Cashfree payment");
        return;
      }

      const { payment_session_id } = cfRes;

      if (!window.Cashfree) {
        toast.error("Cashfree SDK not loaded");
        return;
      }

      const cashfree = window.Cashfree({ mode: "production" });

      const options = {
        paymentSessionId: payment_session_id,
        redirectTarget: "_modal", // popup
      };

      cashfree.checkout(options).then(async (result: any) => {
        console.log("Cashfree Result →", result);

        // ALWAYS VERIFY ORDER ON BACKEND
        const verifyRes = await protectedPost(
          "payment/verify/",
          { order_id: backendOrderId },
          navigate
        );

        if (verifyRes?.status === "success") {
          setOrderNumber(backendOrderId);
          toast.success("Payment Successful!");
          setStep(3);   // Show local success screen
        } else {
          toast.error("Payment Failed");
          setStep(3);   // Still move to step 3 and show fail UI
        }

      });
    }
  };

  /* -----------------------------
        LOADING / EMPTY STATES
  ----------------------------- */
  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Please login to continue
      </div>
    );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );

  if (cartItems.length === 0 && step !== 3)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <p>Your cart is empty</p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#C8A962] px-4 py-2 rounded-lg mt-4"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );

  /* -----------------------------
        STEP 3 — CONFIRMATION
  ----------------------------- */
  if (step === 3)
    return (
      <div className="min-h-screen flex items-center justify-center text-white py-12">
        <div className="bg-white/10 p-8 rounded-xl backdrop-blur-md text-center max-w-md">
          <h2 className="text-3xl font-bold mb-3">Order Confirmed!</h2>
          <p className="text-white/70 mb-4">Your payment was successful</p>

          <p className="text-sm text-white/60">Order Number</p>
          <p className="text-2xl font-bold text-[#C8A962] mb-6">
            {orderNumber}
          </p>

          <button
            onClick={() => navigate("/orders")}
            className="w-full bg-[#C8A962] py-3 rounded-lg font-semibold"
          >
            View Orders
          </button>
        </div>
      </div>
    );

  /* -----------------------------
        MAIN UI
  ----------------------------- */
  return (
    <div className="min-h-screen py-10 px-4 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        {/* ADDRESS SECTION */}
        {/* ADDRESS SECTION */}
        <div className="bg-white/10 p-5 rounded-xl backdrop-blur-md mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Shipping Address</h2>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAddressModalOpen(true);
                  setTimeout(() => {
                    document.getElementById("address-list")?.scrollIntoView({ behavior: "smooth" });
                  }, 50);
                }}
                className="bg-[#C8A962] px-4 py-1 rounded-lg"
              >
                Change Address
              </button>


            </div>
          </div>

          {selectedAddress ? (
            <div className="mt-3">
              <p className="font-bold">{selectedAddress.full_name}</p>
              <p className="text-white/80">{selectedAddress.phone}</p>
              <p className="text-white/80">{selectedAddress.address_line}</p>
              <p className="text-white/80">
                {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
              </p>
            </div>
          ) : (
            <p className="text-white/60 mt-3">No address selected</p>
          )}
        </div>


        {/* PAYMENT SECTION */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white/10 p-6 rounded-xl backdrop-blur-md mb-6">
            <h2 className="text-2xl font-bold mb-4">Payment Method</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                />
                Online Payment (Cashfree)
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "wallet"}
                  onChange={() => setPaymentMethod("wallet")}
                  disabled={walletBalance < total}
                />
                <span
                  className={
                    walletBalance < total ? "text-white/40" : "text-white"
                  }
                >
                  Wallet (Balance: ₹{walletBalance})
                </span>
              </label>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="bg-white/10 p-6 rounded-xl backdrop-blur-md">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

            {cartItems.map((item) => (
              <div key={item.cart_id} className="flex gap-4 mb-4">
                <img
                  src={item.product.image}
                  className="w-20 h-20 object-cover rounded-lg"
                />

                <div>
                  <p className="font-semibold">{item.product.name}</p>
                  <p className="text-white/70">Qty: {item.quantity}</p>
                  <p className="font-bold">
                    ₹
                    {(
                      (item.variant.final_price || item.variant.price) *
                      item.quantity
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}

            {/* COUPON SECTION */}
            <div className="bg-white/10 p-4 rounded-xl mt-4">
              <h3 className="text-lg font-semibold mb-2">Apply Coupon</h3>

              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="COUPON CODE"
                  className="flex-1 p-3 rounded-lg text-black"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={applyingCoupon}
                  className="px-4 bg-white text-black rounded-lg"
                >
                  Apply
                </button>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-400 mt-2">
                  <span>Discount</span>
                  <span>- ₹{discount.toLocaleString()}</span>
                </div>
              )}
            </div>


            <div className="flex justify-between text-xl font-bold mt-6">
              <span>Total</span>
              <span>₹{payableTotal.toLocaleString()}</span>
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-[#C8A962] py-3 rounded-lg font-semibold"
            >
              {step === 1
                ? "Continue to Payment"
                : paymentMethod === "wallet"
                  ? "Pay with Wallet"
                  : "Pay Now"}
            </button>
          </div>
        </form>
      </div>

      {/* -----------------------------
          ADDRESS MODAL
      ----------------------------- */}
      {addressModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[999] p-4">
          <div className="bg-[#1A1A1A] w-full max-w-lg rounded-2xl shadow-xl p-6 relative">

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setAddressModalOpen(false)}
              className="absolute top-3 right-3 text-white/70 hover:text-white text-xl"
            >
              ✕
            </button>

            {/* 🔥 SHOW LIST OR FORM BASED ON toggle */}
            {!showAddForm ? (
              <>
                {/* ADDRESS LIST MODE */}
                <h2 className="text-2xl font-bold text-white mb-4">Select Address</h2>

                <div className="max-h-60 overflow-y-auto space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedAddress?.id === addr.id
                        ? "bg-[#C8A962]/20 border-[#C8A962]"
                        : "bg-white/10 border-white/20 hover:border-white/40"
                        }`}
                      onClick={() => {
                        setSelectedAddress(addr);
                        setAddressModalOpen(false);
                      }}
                    >
                      <p className="font-bold text-white">{addr.full_name}</p>
                      <p className="text-white/70 text-sm">{addr.phone}</p>
                      <p className="text-white/70 text-sm">{addr.address_line}</p>
                      <p className="text-white/70 text-sm">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ADD NEW ADDRESS BUTTON */}
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full mt-5 py-3 bg-[#C8A962] text-black font-semibold rounded-lg"
                >
                  Add New Address
                </button>
              </>
            ) : (
              <>
                {/* ADD NEW ADDRESS FORM MODE */}
                <h2 className="text-2xl font-bold text-white mb-4">Add New Address</h2>

                <form
                  onSubmit={handleAddAddress}
                  className="space-y-3 max-h-60 overflow-y-auto pr-1"
                >
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newAddress.full_name}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, full_name: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-white/10 text-white"
                  />

                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={newAddress.phone}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, phone: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-white/10 text-white"
                  />

                  <input
                    type="text"
                    placeholder="Address Line"
                    value={newAddress.address_line}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, address_line: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-white/10 text-white"
                  />

                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-white/10 text-white"
                  />

                  <input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, state: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-white/10 text-white"
                  />

                  <input
                    type="text"
                    placeholder="Pincode"
                    value={newAddress.pincode}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, pincode: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-white/10 text-white"
                  />

                  {/* SAVE BUTTON */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#C8A962] text-black font-semibold rounded-lg"
                  >
                    Save Address
                  </button>
                </form>

                {/* BACK BUTTON */}
                <button
                  onClick={() => setShowAddForm(false)}
                  className="w-full mt-4 py-3 bg-white/20 text-white rounded-lg"
                >
                  ← Back to Address List
                </button>
              </>
            )}
          </div>
        </div>
      )}


    </div>
  );
};
