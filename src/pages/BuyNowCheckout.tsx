import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { protectedGet, protectedPost } from "../lib/protectedApi";

export const BuyNowCheckout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const { product, variant, quantity } = location.state || {};

    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    /* ================= COUPON ================= */
    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const [finalTotal, setFinalTotal] = useState<number | null>(null);
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    /* ================= UPI ================= */
    const [upiInitiated, setUpiInitiated] = useState(false);
    const [transactionId, setTransactionId] = useState("");
    const [txnSubmitted, setTxnSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!product || !variant || !quantity) {
            navigate("/");
            return;
        }
        loadAddresses();
        setLoading(false);
    }, []);

    const loadAddresses = async () => {
        const data = await protectedGet("address/", navigate);
        if (data) {
            setAddresses(data);
            const def = data.find((a: any) => a.is_default);
            setSelectedAddress(def || null);
        }
    };

    const baseTotal =
        (variant.final_price || variant.price) * quantity;

    const payableTotal =
        finalTotal !== null ? finalTotal : baseTotal;

    /* ================= APPLY COUPON ================= */
    const applyCoupon = async () => {
        if (!coupon.trim()) {
            toast.error("Enter a coupon code");
            return;
        }

        setApplyingCoupon(true);

        try {
            const res = await protectedPost(
                "/buy-now/apply-coupon/",
                {
                    code: coupon,
                    variant_id: variant.id,
                    quantity,
                },
                navigate
            );

            if (!res || res.discount == null || res.final_total == null) {
                throw new Error("Invalid coupon response");
            }

            setDiscount(Number(res.discount));
            setFinalTotal(Number(res.final_total));
            toast.success("Coupon applied");
        } catch (err: any) {
            setDiscount(0);
            setFinalTotal(null);
            toast.error(
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                "Invalid coupon"
            );
        } finally {
            setApplyingCoupon(false);
        }
    };

    /* ================= PLACE ORDER ================= */
    const handlePlaceOrder = () => {
        if (!selectedAddress) {
            toast.error("Select a shipping address");
            return;
        }

        setUpiInitiated(true);
        toast.success("Scan QR and complete payment");
    };

    /* ================= SUBMIT TRANSACTION ================= */
    const submitTransactionId = async () => {
        if (transactionId.length !== 12) {
            toast.error("Transaction ID must be exactly 12 characters");
            return;
        }

        setSubmitting(true);

        const res = await protectedPost(
            "checkout/buy-now/",
            {
                product_id: product.id,
                variant_id: variant.id,
                quantity,
                address_id: selectedAddress.id,
                payment_method: "upi_manual",
                transaction_id: transactionId,
                coupon_code: coupon || null, // ✅ SEND COUPON
            },
            navigate
        );

        setSubmitting(false);

        if (!res) return;

        setTxnSubmitted(true);
        toast.success("Payment submitted. Please wait for confirmation.");
    };

    if (!user || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10 px-4 text-white">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Buy Now Checkout</h1>

                {/* ================= SHIPPING ADDRESS ================= */}
                <div className="bg-white/10 p-6 rounded-xl mb-6">
                    <h2 className="text-xl font-semibold mb-3">
                        Shipping Address
                    </h2>

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
                            <p className="text-sm text-white/70">
                                {addr.address_line}
                            </p>
                            <p className="text-sm text-white/70">
                                {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ================= ORDER SUMMARY ================= */}
                <div className="bg-white/10 p-6 rounded-xl">
                    <h2 className="text-xl font-semibold mb-4">
                        Order Summary
                    </h2>

                    <div className="flex gap-4 mb-4">
                        <img
                            src={variant.images[0].image_url}
                            className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div>
                            <p className="font-bold">{product.name}</p>
                            <p className="text-white/70">Qty: {quantity}</p>
                            <p className="text-[#C8A962] font-bold text-lg">
                                ₹{payableTotal.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* ================= COUPON SECTION ================= */}
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
                                className="bg-white text-black px-4 rounded-lg font-semibold disabled:opacity-60"
                            >
                                {applyingCoupon ? "Applying..." : "Apply"}
                            </button>
                        </div>

                        {discount > 0 && (
                            <div className="flex justify-between text-green-400 mt-2">
                                <span>Discount</span>
                                <span>- ₹{discount}</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handlePlaceOrder}
                        disabled={upiInitiated}
                        className="w-full bg-[#C8A962] text-black py-4 rounded-lg font-semibold disabled:opacity-60"
                    >
                        Place Order
                    </button>
                </div>

                {/* ================= UPI QR PAYMENT ================= */}
                {upiInitiated && (
                    <div className="bg-white/10 p-6 rounded-xl mt-6 space-y-4 text-center">
                        <h3 className="text-lg font-semibold">
                            Scan & Pay via UPI
                        </h3>

                        <img
                            src="https://fashionfactory-media.s3.us-east-2.amazonaws.com/media/banners/WhatsApp+Image+2026-02-02+at+14.20.52.jpeg"
                            alt="UPI QR Code"
                            className="mx-auto w-64 h-64 rounded-xl bg-white p-2"
                        />

                        <p className="text-sm text-white/80">
                            UPI ID:
                            <span className="ml-1 font-semibold text-white">
                                fashionfactry01@oksbi
                            </span>
                        </p>

                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    "fashionfactry01@oksbi"
                                );
                                toast.success("UPI ID copied");
                            }}
                            className="text-sm underline text-[#C8A962]"
                        >
                            Copy UPI ID
                        </button>

                        {!txnSubmitted ? (
                            <>
                                <input
                                    value={transactionId}
                                    onChange={(e) =>
                                        setTransactionId(e.target.value)
                                    }
                                    maxLength={12}
                                    placeholder="Enter 12-digit Transaction ID"
                                    className="w-full p-3 rounded-lg text-black mt-4"
                                />

                                <button
                                    onClick={submitTransactionId}
                                    disabled={submitting}
                                    className="w-full bg-[#C8A962] text-black py-3 rounded-lg font-semibold disabled:opacity-60"
                                >
                                    {submitting
                                        ? "Submitting..."
                                        : "Submit Transaction ID"}
                                </button>
                            </>
                        ) : (
                            <div className="text-sm text-white/80 space-y-2 mt-4">
                                <p>✅ Payment details received.</p>
                                <p>
                                    Please wait up to <b>1 hour</b> for
                                    confirmation.
                                </p>
                                <p>If no response, contact us:</p>

                                <a
                                    href="https://wa.me/919961463109"
                                    target="_blank"
                                    className="text-[#25D366] underline font-semibold"
                                >
                                    WhatsApp: 9961463109
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
