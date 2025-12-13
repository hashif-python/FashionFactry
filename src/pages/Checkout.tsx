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

  /* -----------------------------
        STATE
  ----------------------------- */
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    full_name: "",
    phone: "",
    pincode: "",
    address_line: "",
    city: "",
    state: "",
    is_default: false,
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
          { address_id: selectedAddress.id, payment_method: "wallet" },
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
        { address_id: selectedAddress.id, payment_method: "online" },
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
        <div className="bg-white/10 p-5 rounded-xl backdrop-blur-md mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Shipping Address</h2>

            <button
              onClick={() => setAddressModalOpen(true)}
              className="bg-[#C8A962] px-4 py-1 rounded-lg"
            >
              Change / Add Address
            </button>
          </div>

          {selectedAddress ? (
            <div className="mt-3">
              <p className="font-bold">{selectedAddress.full_name}</p>
              <p className="text-white/80">{selectedAddress.phone}</p>
              <p className="text-white/80">{selectedAddress.address_line}</p>
              <p className="text-white/80">
                {selectedAddress.city}, {selectedAddress.state} -{" "}
                {selectedAddress.pincode}
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

            <div className="flex justify-between text-xl font-bold mt-6">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl w-full max-w-md">

            <h2 className="text-2xl font-bold mb-4">Add / Select Address</h2>

            {/* Existing Address List */}
            <div className="mb-4 max-h-60 overflow-y-auto">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-3 rounded-lg mb-2 cursor-pointer ${selectedAddress?.id === addr.id
                    ? "bg-[#C8A962]"
                    : "bg-white/20"
                    }`}
                  onClick={() => setSelectedAddress(addr)}
                >
                  <p className="font-bold">{addr.full_name}</p>
                  <p>{addr.address_line}</p>
                  <p>
                    {addr.city}, {addr.state}
                  </p>
                  <p>{addr.pincode}</p>
                </div>
              ))}
            </div>

            {/* Add Address Form */}
            <form onSubmit={handleAddAddress} className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={newAddressForm.full_name}
                onChange={(e) =>
                  setNewAddressForm({ ...newAddressForm, full_name: e.target.value })
                }
                className="w-full p-2 rounded bg-white/20 text-white"
              />

              <input
                type="text"
                placeholder="Phone"
                value={newAddressForm.phone}
                onChange={(e) =>
                  setNewAddressForm({ ...newAddressForm, phone: e.target.value })
                }
                className="w-full p-2 rounded bg-white/20 text-white"
              />

              <input
                type="text"
                placeholder="Pincode"
                value={newAddressForm.pincode}
                onChange={(e) =>
                  setNewAddressForm({ ...newAddressForm, pincode: e.target.value })
                }
                className="w-full p-2 rounded bg-white/20 text-white"
              />

              <textarea
                placeholder="Address Line"
                value={newAddressForm.address_line}
                onChange={(e) =>
                  setNewAddressForm({ ...newAddressForm, address_line: e.target.value })
                }
                className="w-full p-2 rounded bg-white/20 text-white"
              />

              <input
                type="text"
                placeholder="City"
                value={newAddressForm.city}
                onChange={(e) =>
                  setNewAddressForm({ ...newAddressForm, city: e.target.value })
                }
                className="w-full p-2 rounded bg-white/20 text-white"
              />

              <input
                type="text"
                placeholder="State"
                value={newAddressForm.state}
                onChange={(e) =>
                  setNewAddressForm({ ...newAddressForm, state: e.target.value })
                }
                className="w-full p-2 rounded bg-white/20 text-white"
              />

              <button
                type="submit"
                className="w-full bg-[#C8A962] py-2 rounded-lg font-semibold"
              >
                Add Address
              </button>
            </form>

            <button
              onClick={() => setAddressModalOpen(false)}
              className="mt-4 w-full py-2 rounded-lg font-semibold bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
