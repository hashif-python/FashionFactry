import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { protectedGet, protectedPost } from "../lib/protectedApi";

/* Required for PayU Checkout Plus */
declare global {
  interface Window {
    bolt: any;
  }
}

export const Checkout = () => {
  const navigate = useNavigate();
  const { user, setCartCount } = useAuth();

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

  const [paymentMethod, setPaymentMethod] = useState("payu");
  const [walletBalance, setWalletBalance] = useState(0);

  const [step, setStep] = useState(1);
  const [orderNumber, setOrderNumber] = useState("");
  const [paymentStatus, setPaymentStatus] =
    useState<"success" | "failed" | null>(null);

  const [processing, setProcessing] = useState(false); // prevent double-click

  /* LOAD ON USER AVAILABLE */
  useEffect(() => {
    if (user) {
      loadCart();
      loadAddresses();
      loadWallet();
    }
  }, [user]);

  useEffect(() => {
    if (step === 3 || step === 4) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

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

  /* ----------------------------
     ADD NEW ADDRESS
  ----------------------------- */
  const handleAddAddress = async (e: any) => {
    e.preventDefault();

    const res = await protectedPost("address/", newAddressForm, navigate);

    if (res) {
      toast.success("Address added");
      setAddressModalOpen(false);
      setNewAddressForm({
        full_name: "",
        phone: "",
        pincode: "",
        address_line: "",
        city: "",
        state: "",
        is_default: false,
      });
      loadAddresses();
    }
  };

  /* ----------------------------
     HANDLE CHECKOUT + PAYMENT
  ----------------------------- */
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (processing) return;
    setProcessing(true);

    if (!selectedAddress) {
      toast.error("Please select an address");
      setProcessing(false);
      return;
    }

    if (step === 1) {
      setStep(2);
      setProcessing(false);
      return;
    }

    if (step === 2) {
      /* WALLET PAYMENT ------------------------------ */
      if (paymentMethod === "wallet") {
        const total = cartItems.reduce(
          (sum, item) =>
            sum +
            (item.variant.final_price || item.variant.price) * item.quantity,
          0
        );

        if (walletBalance < total) {
          toast.error("Insufficient wallet balance");
          setProcessing(false);
          return;
        }

        const res = await protectedPost(
          "checkout/",
          { address_id: selectedAddress.id, payment_method: "wallet" },
          navigate
        );

        if (!res) {
          setProcessing(false);
          return;
        }

        setOrderNumber(res.order_id);
        setPaymentStatus("success");
        setStep(3);
        setProcessing(false);
        setCartCount(0);
        return;
      }

      /* PAYU PAYMENT -------------------------------- */
      const checkoutRes = await protectedPost(
        "checkout/",
        { address_id: selectedAddress.id, payment_method: "payu" },
        navigate
      );

      if (!checkoutRes) {
        setProcessing(false);
        return;
      }

      const backendOrderId = checkoutRes.order_id;

      const payuInit = await protectedPost(
        "payment/payu/initiate/",
        { order_id: backendOrderId },
        navigate
      );

      if (!payuInit || !payuInit.params) {
        toast.error("Unable to reach PayU");
        setProcessing(false);
        return;
      }

      const payu = payuInit.params;

      if (!window.bolt || !window.bolt.launch) {
        toast.error("PayU script not loaded");
        setProcessing(false);
        return;
      }

      window.bolt.launch(
        {
          key: payu.key,
          txnid: payu.txnid,
          hash: payu.hash,
          amount: payu.amount,
          firstname: payu.firstname,
          email: payu.email,
          phone: payu.phone,
          productinfo: payu.productinfo,
          surl: payu.surl,
          furl: payu.furl,
        },
        {
          responseHandler: async (BOLT: any) => {
            console.log("BOLT RESPONSE:", BOLT);

            const verifyRes = await protectedPost(
              "payment/payu/verify/",
              {
                txnid: BOLT.response.txnid,
                mihpayid: BOLT.response.mihpayid,
                status: BOLT.response.txnStatus,
                amount: BOLT.response.amount,
              },
              navigate
            );

            if (verifyRes?.status === "success") {
              setOrderNumber(backendOrderId);
              setPaymentStatus("success");
              setCartCount(0);
              setStep(3);
            } else {
              setPaymentStatus("failed");
              setStep(4);
            }

            setProcessing(false);
          },

          catchException: (err: any) => {
            console.log("PayU Exception:", err);
            toast.error("Payment error occurred");
            setPaymentStatus("failed");
            setStep(4);
            setProcessing(false);
          },
        }
      );
    }
  };

  /* -----------------------------
       HIDE MOBILE BOTTOM NAV ON SUCCESS/FAILURE
  ------------------------------ */
  useEffect(() => {
    const bottomNav = document.querySelector(".mobile-bottom-nav");

    if (step === 3 || step === 4) bottomNav?.classList.add("hidden");
    else bottomNav?.classList.remove("hidden");

    return () => bottomNav?.classList.remove("hidden");
  }, [step]);

  /* -----------------------------
       SUCCESS SCREEN (CENTERED)
  ------------------------------ */
  if (step === 3 && paymentStatus === "success")
    return (
      <div className="min-h-screen flex items-center justify-center text-white px-6">
        <div className="bg-white/10 p-8 rounded-xl text-center backdrop-blur-xl max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-700" />
          </div>

          <h2 className="text-3xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-white/70 mb-4">Your order has been placed.</p>

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
       FAILURE SCREEN (CENTERED)
  ------------------------------ */
  if (step === 4 && paymentStatus === "failed")
    return (
      <div className="min-h-screen flex items-center justify-center text-white px-6">
        <div className="bg-white/10 p-8 rounded-xl text-center backdrop-blur-xl max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-red-700" />
          </div>

          <h2 className="text-3xl font-bold mb-2">Payment Failed!</h2>
          <p className="text-white/70 mb-4">
            Your payment could not be completed.
          </p>

          <button
            onClick={() => {
              setStep(2);
              setProcessing(false);
            }}
            className="w-full bg-red-500 py-3 rounded-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  /* -----------------------------
       DEFAULT CHECKOUT SCREEN
  ------------------------------ */

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
            className="bg[#C8A962] px-4 py-2 rounded-lg mt-4"
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
                  checked={paymentMethod === "payu"}
                  onChange={() => setPaymentMethod("payu")}
                />
                PayU (UPI, Card, NetBanking)
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
              disabled={processing}
              className="w-full mt-6 bg-[#C8A962] py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {processing
                ? "Processing..."
                : step === 1
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
