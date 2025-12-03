import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

import {
  protectedGet,
  protectedPost,
} from "../lib/protectedApi";

/* --------------------------------------------------------------
   Razorpay Script Loader
--------------------------------------------------------------- */
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/* --------------------------------------------------------------
      MAIN CHECKOUT COMPONENT
--------------------------------------------------------------- */
export const Checkout = () => {
  const navigate = useNavigate();
  const { user, setCartCount } = useAuth();

  /* CART & INITIAL STATES */
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ADDRESS STATES */
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

  /* PAYMENT STATES */
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [walletBalance, setWalletBalance] = useState(0);

  /* CHECKOUT STEP */
  const [step, setStep] = useState(1);
  const [orderNumber, setOrderNumber] = useState("");

  /* --------------------------------------------------------------
      LOAD CART + ADDRESSES + WALLET
  --------------------------------------------------------------- */
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

  /* --------------------------------------------------------------
      ADD NEW ADDRESS
  --------------------------------------------------------------- */
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
      await loadAddresses();
      setAddressModalOpen(false);
    }
  };

  /* --------------------------------------------------------------
      HANDLE CHECKOUT
  --------------------------------------------------------------- */
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    // STEP 1 → Go to payment step
    if (step === 1) {
      setStep(2);
      return;
    }

    // STEP 2 → Payment Step
    if (step === 2) {
      if (paymentMethod === "wallet") {
        if (walletBalance < total) {
          toast.error("Insufficient wallet balance");
          return;
        }

        // WALLET PAYMENT
        const res = await protectedPost(
          "checkout/",
          {
            address_id: selectedAddress.id,
            payment_method: "wallet",
          },
          navigate
        );

        if (!res) return;

        toast.success("Order placed using wallet");
        setOrderNumber(res.order_id);
        setStep(3);
        loadWallet();
        return;
      }

      // RAZORPAY PAYMENT
      const checkoutRes = await protectedPost(
        "checkout/",
        {
          address_id: selectedAddress.id,
          payment_method: "razorpay",
        },
        navigate
      );

      if (!checkoutRes) return;

      const backendOrderId = checkoutRes.order_id;
      const amount = checkoutRes.total;

      const rpOrder = await protectedPost(
        "payment/razorpay/create/",
        { amount },
        navigate
      );

      if (!rpOrder) {
        toast.error("Failed to create payment order");
        return;
      }

      // Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Failed to load Razorpay");
        return;
      }

      const options = {
        key: rpOrder.key_id,
        order_id: rpOrder.order_id,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: "Fashion Factory",
        description: "Order Payment",

        handler: async function (response: any) {
          await protectedPost(
            "payment/razorpay/verify/",
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: backendOrderId,
            },
            navigate
          );

          setOrderNumber(backendOrderId);
          setStep(3);
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

      return;
    }
  };

  /* --------------------------------------------------------------
      LOADING & EMPTY STATES
  --------------------------------------------------------------- */
  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Please login to continue</p>
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

  const total = cartItems.reduce(
    (sum, item) =>
      sum +
      (item.variant.final_price || item.variant.price) * item.quantity,
    0
  );

  /* --------------------------------------------------------------
      STEP 3 — ORDER SUCCESS PAGE
  --------------------------------------------------------------- */
  if (step === 3)
    return (
      <div className="min-h-screen flex items-center justify-center text-white py-12">
        <div className="bg-white/10 p-8 rounded-xl backdrop-blur-md text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-700" />
          </div>

          <h2 className="text-3xl font-bold mb-3">Order Confirmed!</h2>
          <p className="text-white/70 mb-4">Your order has been placed</p>

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

  /* --------------------------------------------------------------
      MAIN CHECKOUT UI
  --------------------------------------------------------------- */
  return (
    <div className="min-h-screen py-10 px-4 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        {/* ======================== ADDRESS SECTION ======================== */}
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

        {/* ======================== ADDRESS MODAL ======================== */}
        {addressModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[999]">
            <div className="bg-white/10 p-6 rounded-xl w-full max-w-xl relative">
              <button
                onClick={() => setAddressModalOpen(false)}
                className="absolute top-3 right-3"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              <h2 className="text-xl font-bold mb-4">Select Address</h2>

              {/* Address list */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => {
                      setSelectedAddress(addr);
                      toast.success("Address Selected");
                      setAddressModalOpen(false); // auto close
                    }}
                    className={`w-full text-left p-4 rounded-lg border transition-all 
                      ${selectedAddress?.id === addr.id
                        ? "border-[#C8A962] bg-[#C8A962]/30"
                        : "border-white/20 bg-white/10 hover:border-[#C8A962]"
                      }
                    `}
                  >
                    <p className="font-bold">{addr.full_name}</p>
                    <p className="text-white/80">{addr.phone}</p>
                    <p className="text-white/80">{addr.address_line}</p>
                    <p className="text-white/80">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>

                    {addr.is_default && (
                      <span className="text-xs bg-green-600 px-2 py-1 rounded mt-2 inline-block">
                        Default
                      </span>
                    )}
                  </button>
                ))}

                {addresses.length === 0 && (
                  <p className="text-center text-white/60">
                    No addresses added
                  </p>
                )}
              </div>

              {/* Add new address */}
              <h2 className="text-xl font-bold mt-6 mb-3">Add New Address</h2>

              <form onSubmit={handleAddAddress} className="space-y-3">
                <input
                  required
                  placeholder="Full Name"
                  className="w-full px-4 py-2 rounded-lg text-black"
                  value={newAddressForm.full_name}
                  onChange={(e) =>
                    setNewAddressForm({
                      ...newAddressForm,
                      full_name: e.target.value,
                    })
                  }
                />

                <input
                  required
                  placeholder="Phone"
                  className="w-full px-4 py-2 rounded-lg text-black"
                  value={newAddressForm.phone}
                  onChange={(e) =>
                    setNewAddressForm({
                      ...newAddressForm,
                      phone: e.target.value,
                    })
                  }
                />

                <div className="grid grid-cols-3 gap-3">
                  <input
                    required
                    placeholder="Pincode"
                    className="px-4 py-2 rounded-lg text-black"
                    value={newAddressForm.pincode}
                    onChange={(e) =>
                      setNewAddressForm({
                        ...newAddressForm,
                        pincode: e.target.value,
                      })
                    }
                  />
                  <input
                    required
                    placeholder="City"
                    className="px-4 py-2 rounded-lg text-black"
                    value={newAddressForm.city}
                    onChange={(e) =>
                      setNewAddressForm({
                        ...newAddressForm,
                        city: e.target.value,
                      })
                    }
                  />
                  <input
                    required
                    placeholder="State"
                    className="px-4 py-2 rounded-lg text-black"
                    value={newAddressForm.state}
                    onChange={(e) =>
                      setNewAddressForm({
                        ...newAddressForm,
                        state: e.target.value,
                      })
                    }
                  />
                </div>

                <textarea
                  required
                  rows={3}
                  placeholder="Full Address"
                  className="w-full px-4 py-2 rounded-lg text-black"
                  value={newAddressForm.address_line}
                  onChange={(e) =>
                    setNewAddressForm({
                      ...newAddressForm,
                      address_line: e.target.value,
                    })
                  }
                />

                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={newAddressForm.is_default}
                    onChange={(e) =>
                      setNewAddressForm({
                        ...newAddressForm,
                        is_default: e.target.checked,
                      })
                    }
                  />
                  Make this my default address
                </label>

                <button
                  type="submit"
                  className="w-full bg-[#C8A962] py-2 rounded-lg font-semibold"
                >
                  Add Address
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ======================== PAYMENT SECTION ======================== */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white/10 p-6 rounded-xl backdrop-blur-md mb-6">
            <h2 className="text-2xl font-bold mb-4">Payment Method</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                />
                Razorpay (UPI, Card, NetBanking)
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
                  {walletBalance < total && (
                    <span className="text-red-400 ml-2 text-sm">
                      Not enough balance
                    </span>
                  )}
                </span>
              </label>
            </div>
          </div>

          {/* ======================== ORDER SUMMARY ======================== */}
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
    </div>
  );
};
