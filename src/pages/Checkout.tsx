import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import {
  protectedGet,
  protectedPost,
  protectedPostMultipart,
} from "../lib/protectedApi";

export const Checkout = () => {
  const navigate = useNavigate();
  const { user, setCartCount } = useAuth();

  /* ================= STATE ================= */
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ================= PAYMENT ================= */
  const [paymentMethod, setPaymentMethod] = useState<"cashfree" | "wallet">(
    "cashfree"
  );

  /* ================= COUPON ================= */
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState<number | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  /* ================= UPI ================= */
  const [showUpi, setShowUpi] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  /* ================= LOAD ================= */
  useEffect(() => {
    if (user) {
      loadCart();
      loadAddresses();
      loadWallet();
    }
  }, [user]);

  const loadCart = async () => {
    const data = await protectedGet("cart/", navigate);

    if (!data || data.length === 0) {
      navigate("/");
      return;
    }

    setCartItems(data);
    setCartCount(data.length);
    setLoading(false);
  };

  const loadAddresses = async () => {
    const data = await protectedGet("address/", navigate);
    if (data) {
      setAddresses(data);
      setSelectedAddress(data.find((a: any) => a.is_default) || null);
    }
  };

  const loadWallet = async () => {
    const data = await protectedGet("wallet/", navigate);
    if (data) setWalletBalance(Number(data.balance));
  };

  /* ================= APPLY COUPON ================= */
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

      setDiscount(Number(res.discount));
      setFinalTotal(Number(res.final_total));
      toast.success("Coupon applied");
    } catch {
      setDiscount(0);
      setFinalTotal(null);
      toast.error("Invalid coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  /* ================= TOTAL ================= */
  const total = cartItems.reduce(
    (sum, item) =>
      sum +
      (item.variant.final_price || item.variant.price) * item.quantity,
    0
  );

  const payableTotal = finalTotal !== null ? finalTotal : total;

  /* ================= CHECKOUT ================= */
  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    if (paymentMethod === "wallet") {
      const res = await protectedPost(
        "checkout/",
        {
          address_id: selectedAddress.id,
          payment_method: "wallet",
          coupon_code: coupon || null,
        },
        navigate
      );

      if (!res) return;

      toast.success("Order placed successfully");
      navigate("/orders");
      return;
    }

    setShowUpi(true);
    toast.success("Scan QR & complete payment");
  };

  /* ================= SUBMIT UPI ================= */
  const submitUpiPayment = async () => {
    if (!paymentScreenshot) {
      toast.error("Please upload payment screenshot");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("address_id", String(selectedAddress!.id));
    formData.append("payment_method", "upi_manual");
    if (coupon) formData.append("coupon_code", coupon);
    formData.append("payment_screenshot", paymentScreenshot);

    const res = await protectedPostMultipart("checkout/", formData, navigate);

    setSubmitting(false);

    if (!res) return;

    setCartItems([]);
    setCartCount(0);
    setOrderNumber(res.order_id);
    toast.success("Payment submitted. Awaiting verification.");
  };

  /* ================= STATES ================= */
  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (orderNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="bg-white/10 p-8 rounded-xl text-center">
          <h2 className="text-3xl font-bold mb-3">Order Submitted</h2>
          <p className="text-[#C8A962] text-xl font-bold">{orderNumber}</p>
          <p className="text-white/70 mt-3">
            Please wait up to 1 hour for confirmation.
          </p>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen py-10 px-4 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        {/* ================= UPI ONLY VIEW ================= */}
        {showUpi ? (
          <div className="bg-white/10 p-6 rounded-xl text-center">
            <img
              src="https://fashionfactory-media.s3.us-east-2.amazonaws.com/media/banners/WhatsApp+Image+2026-02-02+at+14.20.52.jpeg"
              className="mx-auto w-64 h-64 bg-white p-2 rounded-xl"
            />

            <p className="mt-3">
              UPI ID: <b>fashionfactry01@oksbi</b>
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setPaymentScreenshot(e.target.files?.[0] || null)
              }
              className="w-full p-3 mt-4 rounded-lg text-black"
            />

            <button
              onClick={submitUpiPayment}
              disabled={submitting}
              className="w-full mt-4 bg-[#C8A962] py-3 rounded-lg font-semibold"
            >
              Submit Payment Proof
            </button>
          </div>
        ) : (
          <>
            {/* ================= SHIPPING ADDRESS ================= */}
            <div className="bg-white/10 p-6 rounded-xl mb-6">
              <h2 className="text-xl font-semibold mb-3">Shipping Address</h2>

              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr)}
                  className={`p-4 rounded-lg cursor-pointer border mb-3 ${selectedAddress?.id === addr.id
                      ? "border-[#C8A962] bg-[#C8A962]/20"
                      : "border-white/20"
                    }`}
                >
                  <p className="font-bold">{addr.full_name}</p>
                  <p className="text-white/70">{addr.phone}</p>
                  <p className="text-white/70">
                    {addr.address_line}, {addr.city}, {addr.state} -{" "}
                    {addr.pincode}
                  </p>
                </div>
              ))}
            </div>

            {/* ================= PAYMENT METHOD ================= */}
            <div className="bg-white/10 p-6 rounded-xl mb-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

              <label className="flex gap-3 mb-3">
                <input
                  type="radio"
                  checked={paymentMethod === "cashfree"}
                  onChange={() => setPaymentMethod("cashfree")}
                />
                Online Payment (UPI QR)
              </label>

              <label className="flex gap-3">
                <input
                  type="radio"
                  checked={paymentMethod === "wallet"}
                  disabled={walletBalance < payableTotal}
                  onChange={() => setPaymentMethod("wallet")}
                />
                Wallet (Balance ₹{walletBalance})
              </label>
            </div>

            {/* ================= ORDER SUMMARY ================= */}
            <div className="bg-white/10 p-6 rounded-xl">
              {/* COUPON */}
              <div className="bg-white/10 p-4 rounded-xl mb-4">
                <h3 className="font-semibold mb-2">Apply Coupon</h3>
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) =>
                      setCoupon(e.target.value.toUpperCase())
                    }
                    placeholder="COUPON CODE"
                    className="flex-1 p-3 rounded-lg text-black"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={applyingCoupon}
                    className="bg-white text-black px-4 rounded-lg font-semibold"
                  >
                    Apply
                  </button>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-400 mt-2">
                    <span>Discount</span>
                    <span>- ₹{discount}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between font-bold text-xl mt-4">
                <span>Total</span>
                <span>₹{payableTotal}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-[#C8A962] py-3 rounded-lg font-semibold"
              >
                {paymentMethod === "wallet" ? "Pay with Wallet" : "Pay Now"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};