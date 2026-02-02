import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { protectedGet, protectedPost } from "../lib/protectedApi";

/* =========================================================
   Cashfree DISABLED – Manual UPI Flow
   ========================================================= */
// declare global {
//     interface Window {
//         Cashfree: any;
//     }
// }

export const BuyNowCheckout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const { product, variant, quantity } = location.state || {};

    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    /* Coupon */
    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const [finalTotal, setFinalTotal] = useState<number | null>(null);

    /* Manual UPI */
    const [upiInitiated, setUpiInitiated] = useState(false);
    const [transactionId, setTransactionId] = useState("");
    const [txnSubmitted, setTxnSubmitted] = useState(false);

    useEffect(() => {
        if (!product || !variant || !quantity) {
            navigate("/");
            return;
        }
        loadAddresses();
        loadWallet();
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

    const loadWallet = async () => {
        const data = await protectedGet("wallet/", navigate);
        if (data) setWalletBalance(Number(data.balance));
    };

    const baseTotal = (variant.final_price || variant.price) * quantity;
    const payableTotal = finalTotal !== null ? finalTotal : baseTotal;

    /* =========================================================
       PLACE ORDER → AUTO INITIATE UPI
       ========================================================= */
    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.error("Select a shipping address");
            return;
        }

        const checkoutRes = await protectedPost(
            "checkout/buy-now/",
            {
                product_id: product.id,
                variant_id: variant.id,
                quantity,
                address_id: selectedAddress.id,
                payment_method: "upi_manual",
                coupon_code: coupon || null,
            },
            navigate
        );

        if (!checkoutRes) return;

        toast.success("Order created. Redirecting to UPI…");

        /* ✅ AUTO OPEN UPI APP */
        const upiUrl = `upi://pay?pa=fashionfactry01@oksbi&pn=FashionFactry&am=10&cu=INR`;
        window.location.href = upiUrl;

        /* Show Transaction ID input */
        setUpiInitiated(true);
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

                {/* ADDRESS */}
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
                            <p className="text-sm text-white/70">{addr.address_line}</p>
                            <p className="text-sm text-white/70">
                                {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                        </div>
                    ))}
                </div>

                {/* SUMMARY */}
                <div className="bg-white/10 p-6 rounded-xl">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

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

                    <button
                        onClick={handlePlaceOrder}
                        disabled={upiInitiated}
                        className="w-full bg-[#C8A962] text-black py-4 rounded-lg font-semibold disabled:opacity-60"
                    >
                        Place Order
                    </button>
                </div>

                {/* =================================================
                   TRANSACTION ID SECTION (AUTO SHOWN)
                   ================================================= */}
                {upiInitiated && (
                    <div className="bg-white/10 p-6 rounded-xl mt-6 space-y-4">
                        <h3 className="text-lg font-semibold">
                            Enter Transaction ID
                        </h3>

                        {!txnSubmitted ? (
                            <>
                                <input
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    maxLength={12}
                                    placeholder="12-digit Transaction ID"
                                    className="w-full p-3 rounded-lg text-black"
                                />

                                <button
                                    onClick={() => {
                                        if (transactionId.length !== 12) {
                                            toast.error(
                                                "Transaction ID must be exactly 12 characters"
                                            );
                                            return;
                                        }
                                        setTxnSubmitted(true);
                                        toast.success("Transaction ID submitted");
                                    }}
                                    className="w-full bg-white text-black py-3 rounded-lg font-semibold"
                                >
                                    Submit Transaction ID
                                </button>
                            </>
                        ) : (
                            <div className="text-sm text-white/80 space-y-2">
                                <p>
                                    ✅ Payment received. Please wait up to <b>1 hour</b> for confirmation.
                                </p>
                                <p>If no response within 1 hour, contact:</p>
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
