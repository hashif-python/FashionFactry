import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { protectedGet, protectedPost } from "../lib/protectedApi";

export const Checkout = () => {
  const navigate = useNavigate();
  const { user, setCartCount } = useAuth();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [showAddressList, setShowAddressList] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("online"); // online / wallet
  const [walletBalance, setWalletBalance] = useState(0);

  const [step, setStep] = useState(1);
  const [orderNumber, setOrderNumber] = useState("");

  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">(
    "pending"
  );

  const [newAddressForm, setNewAddressForm] = useState({
    full_name: "",
    phone: "",
    pincode: "",
    address_line: "",
    city: "",
    state: "",
    is_default: false,
  });

  // Load data
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

  // Add address
  const handleAddAddress = async (e: any) => {
    e.preventDefault();

    const res = await protectedPost("address/", newAddressForm, navigate);

    if (res) {
      toast.success("Address saved");
      setAddressModalOpen(false);
      loadAddresses();
    }
  };

  // Checkout submit
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!selectedAddress) {
      toast.error("Select an address");
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    const checkoutRes = await protectedPost(
      "checkout/",
      { address_id: selectedAddress.id, payment_method: paymentMethod },
      navigate
    );

    if (!checkoutRes) return;

    const backendOrderId = checkoutRes.order_id;

    // WALLET PAYMENT
    if (paymentMethod === "wallet") {
      toast.success("Wallet payment successful");
      setOrderNumber(backendOrderId);
      setPaymentStatus("success");
      setCartCount(0);
      setStep(3);
      return;
    }

    // ONLINE PAYMENT (SIMULATED)
    if (paymentMethod === "online") {
      toast.success("Payment Successful");
      setOrderNumber(backendOrderId);
      setPaymentStatus("success");
      setCartCount(0);
      setStep(3);
      return;
    }
  };

  /* EMPTY/LOADING */
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

  const total = cartItems.reduce(
    (sum, item) =>
      sum +
      (item.variant.final_price || item.variant.price) * item.quantity,
    0
  );

  /* SUCCESS PAGE */
  if (step === 3)
    return (
      <div className="min-h-screen flex items-center justify-center text-white py-12">
        <div className="bg-white/10 p-8 rounded-xl text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-700" />
          </div>

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

  /* MAIN CHECKOUT */
  return (
    <div className="min-h-screen py-10 px-4 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        {/* ADDRESS SECTION */}
        <div className="bg-white/10 p-5 rounded-xl mb-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold">Shipping Address</h2>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddressList(true)}
                className="bg-[#C8A962] px-4 py-1 rounded-lg"
              >
                Change Address
              </button>

              <button
                onClick={() => setAddressModalOpen(true)}
                className="bg-white/20 px-4 py-1 rounded-lg border border-white/20"
              >
                Add Address
              </button>
            </div>
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
          <div className="bg-white/10 p-6 rounded-xl mb-6">
            <h2 className="text-2xl font-bold mb-4">Payment Method</h2>

            <div className="space-y-4">

              {/* ONLINE PAYMENT */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                />
                Online Payment
              </label>

              {/* WALLET PAYMENT */}
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
                  Wallet (Balance ₹{walletBalance})
                </span>
              </label>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="bg-white/10 p-6 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

            {cartItems.map((item) => (
              <div key={item.cart_id} className="flex gap-4 mb-4">
                <img
                  src={item.product.image}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <p className="font-semibold">{item.product.name}</p>
                  <p>Qty: {item.quantity}</p>
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
                  ? "Pay With Wallet"
                  : "Pay Now"}
            </button>
          </div>
        </form>
      </div>

      {/* ADDRESS LIST MODAL */}
      {showAddressList && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0B2512] text-white p-6 rounded-2xl w-11/12 max-w-md relative">

            <button
              className="absolute top-3 right-3 text-white text-2xl"
              onClick={() => setShowAddressList(false)}
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-4 text-[#C8A962]">Select Address</h2>

            <div className="space-y-4 max-h-80 overflow-y-auto">
              {addresses.map((addr: any) => (
                <div
                  key={addr.id}
                  onClick={() => {
                    setSelectedAddress(addr);
                    setShowAddressList(false);
                  }}
                  className={`p-4 rounded-lg border cursor-pointer ${selectedAddress?.id === addr.id
                      ? "border-[#C8A962] bg-white/10"
                      : "border-white/25"
                    }`}
                >
                  <p className="font-bold">{addr.full_name}</p>
                  <p className="text-white/70">{addr.phone}</p>
                  <p className="text-white/70">{addr.address_line}</p>
                  <p className="text-white/60">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setShowAddressList(false);
                setAddressModalOpen(true);
              }}
              className="w-full mt-5 bg-[#C8A962] text-black py-3 rounded-lg font-semibold"
            >
              Add New Address
            </button>
          </div>
        </div>
      )}

      {/* ADD ADDRESS MODAL */}
      {addressModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0B2512] text-white p-6 rounded-2xl w-11/12 max-w-md relative">

            <button
              className="absolute top-3 right-3 text-white text-2xl"
              onClick={() => setAddressModalOpen(false)}
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-5 text-[#C8A962]">Add / Edit Address</h2>

            <form onSubmit={handleAddAddress} className="space-y-4">

              <input
                type="text"
                placeholder="Full Name"
                value={newAddressForm.full_name}
                onChange={(e) =>
                  setNewAddressForm({ ...newAddressForm, full_name: e.target.value })
                }
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg"
                required
              />

              <input
                type="text"
                placeholder="Phone"
                value={newAddressForm.phone}
                onChange={(e) =>
                  setNewAddressForm({ ...newAddressForm, phone: e.target.value })
                }
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg"
                required
              />

              <input
                type="text"
                placeholder="Pincode"
                value={newAddressForm.pincode}
                onChange={(e) =>
                  setNewAddressForm({ ...newAddressForm, pincode: e.target.value })
                }
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg"
                required
              />

              <textarea
                placeholder="Address Line"
                value={newAddressForm.address_line}
                onChange={(e) =>
                  setNewAddressForm({ ...newAddressForm, address_line: e.target.value })
                }
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg h-20"
                required
              ></textarea>

              <input
                type="text"
                placeholder="City"
                value={newAddressForm.city}
                onChange={(e) =>
                  setNewAddressForm({ ...newAddressForm, city: e.target.value })
                }
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg"
                required
              />

              <input
                type="text"
                placeholder="State"
                value={newAddressForm.state}
                onChange={(e) =>
                  setNewAddressForm({ ...newAddressForm, state: e.target.value })
                }
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg"
                required
              />

              <label className="flex items-center gap-2">
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
                Set as default
              </label>

              <button
                type="submit"
                className="w-full bg-[#C8A962] text-black py-3 rounded-lg font-semibold"
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
