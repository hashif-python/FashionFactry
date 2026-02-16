import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import {
    protectedGet,
    protectedPost,
    protectedPostMultipart,
} from "../lib/protectedApi";

export const BuyNowCheckout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const { product, variant, quantity } = location.state || {};

    /* ================= STATE ================= */
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    /* ================= COUPON ================= */
    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const [finalTotal, setFinalTotal] = useState<number | null>(null);
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [couponApplied, setCouponApplied] = useState(false);

    /* ================= UPI ================= */
    const [showUpi, setShowUpi] = useState(false);
    const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [orderNumber, setOrderNumber] = useState("");

    /* ================= INIT ================= */
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
            setSelectedAddress(data.find((a: any) => a.is_default) || null);
        }
    };

    /* ================= TOTAL ================= */
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
                "buy-now/apply-coupon/",
                {
                    code: coupon,
                    variant_id: variant.id,
                    quantity,
                },
                navigate
            );

            setDiscount(Number(res.discount));
            setFinalTotal(Number(res.final_total));
            setCouponApplied(true);
            toast.success("Coupon applied");
        } catch {
            setDiscount(0);
            setFinalTotal(null);
            setCouponApplied(false);
            toast.error("Invalid coupon");
        } finally {
            setApplyingCoupon(false);
        }
    };

    /* ================= PLACE ORDER ================= */
    const handlePlaceOrder = () => {
        if (!selectedAddress) {
            toast.error("Please select a shipping address");
            return;
        }

        setShowUpi(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        toast.success("Scan QR & complete payment");
    };

    /* ================= SUBMIT UPI ================= */
    const submitUpiPayment = async () => {
        if (!paymentScreenshot) {
            toast.error("Upload payment screenshot");
            return;
        }

        setSubmitting(true);

        const formData = new FormData();
        formData.append("product_id", String(product.id));
        formData.append("variant_id", String(variant.id));
        formData.append("quantity", String(quantity));
        formData.append("address_id", String(selectedAddress!.id));
        formData.append("payment_method", "upi_manual");

        if (couponApplied) {
            formData.append("coupon_code", coupon);
        }

        formData.append("payment_screenshot", paymentScreenshot);

        const res = await protectedPostMultipart(
            "checkout/buy-now/",
            formData,
            navigate
        );

        setSubmitting(false);

        if (!res) return;

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

                    <a
                        href="https://wa.me/919961463109"
                        target="_blank"
                        className="block mt-4 text-[#25D366] underline"
                    >
                        WhatsApp: 9961463109
                    </a>
                </div>
            </div>
        );
    }

    /* ================= UI ================= */
    return (
        <div className="min-h-screen py-10 px-4 text-white">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Buy Now Checkout</h1>

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
                                    <p className="text-white/70">
                                        {addr.address_line}, {addr.city}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* ================= ORDER SUMMARY ================= */}
                        <div className="bg-white/10 p-6 rounded-xl">
                            <div className="flex gap-4 mb-4">
                                <img
                                    src={variant.images?.[0]?.image_url}
                                    className="w-24 h-24 rounded-lg"
                                />
                                <div>
                                    <p className="font-bold">{product.name}</p>
                                    <p>Qty: {quantity}</p>
                                    <p className="font-bold">₹{payableTotal}</p>
                                </div>
                            </div>

                            {/* ================= COUPON ================= */}
                            <div className="bg-white/10 p-4 rounded-xl mb-4">
                                <h3 className="font-semibold mb-2">Apply Coupon</h3>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        value={coupon}
                                        disabled={couponApplied}
                                        onChange={(e) =>
                                            setCoupon(e.target.value.toUpperCase())
                                        }
                                        placeholder="COUPON CODE"
                                        className="flex-1 p-3 rounded-lg text-black"
                                    />
                                    <button
                                        onClick={applyCoupon}
                                        disabled={applyingCoupon || couponApplied}
                                        className="bg-white text-black px-4 rounded-lg font-semibold"
                                    >
                                        {couponApplied ? "Applied" : "Apply"}
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
                                className="w-full bg-[#C8A962] py-4 rounded-lg font-semibold"
                            >
                                Pay Now
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};