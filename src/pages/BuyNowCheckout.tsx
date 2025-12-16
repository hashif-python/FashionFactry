import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { protectedGet, protectedPost } from "../lib/protectedApi";

/* Cashfree global */
declare global {
    interface Window {
        Cashfree: any;
    }
}

export const BuyNowCheckout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const { product, variant, quantity } = location.state || {};

    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<any | null>(null);

    const [paymentMethod, setPaymentMethod] = useState("online");
    const [walletBalance, setWalletBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    /* ---------------- VALIDATION ---------------- */
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

    const total =
        (variant.final_price || variant.price) * quantity;

    /* ---------------- PLACE ORDER ---------------- */
    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.error("Select a shipping address");
            return;
        }

        /* ---------------- BACKEND ORDER ---------------- */
        const checkoutRes = await protectedPost(
            "checkout/buy-now/",
            {
                product_id: product.id,
                variant_id: variant.id,
                quantity,
                address_id: selectedAddress.id,
                payment_method: paymentMethod,
            },
            navigate
        );

        if (!checkoutRes) return;

        const backendOrderId = checkoutRes.order_id;

        /* ---------------- WALLET ---------------- */
        if (paymentMethod === "wallet") {
            toast.success("Order placed successfully");
            navigate("/orders");
            return;
        }

        /* ---------------- CASHFREE ---------------- */
        const cfRes = await protectedPost(
            "payment/initiate/",
            { order_id: backendOrderId },
            navigate
        );

        if (!cfRes || !window.Cashfree) {
            toast.error("Payment initialization failed");
            return;
        }

        const cashfree = window.Cashfree({ mode: "production" });

        cashfree.checkout({
            paymentSessionId: cfRes.payment_session_id,
            redirectTarget: "_modal",
        }).then(async () => {
            const verify = await protectedPost(
                "payment/verify/",
                { order_id: backendOrderId },
                navigate
            );

            if (verify?.status === "success") {
                toast.success("Payment Successful");
                navigate("/orders");
            } else {
                toast.error("Payment Failed");
            }
        });
    };

    if (!user || loading)
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Loading...
            </div>
        );

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

                {/* PAYMENT */}
                <div className="bg-white/10 p-6 rounded-xl mb-6">
                    <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

                    <label className="flex gap-3 mb-3">
                        <input
                            type="radio"
                            checked={paymentMethod === "online"}
                            onChange={() => setPaymentMethod("online")}
                        />
                        Online Payment
                    </label>

                    <label className="flex gap-3">
                        <input
                            type="radio"
                            checked={paymentMethod === "wallet"}
                            disabled={walletBalance < total}
                            onChange={() => setPaymentMethod("wallet")}
                        />
                        Wallet (₹{walletBalance})
                    </label>
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
                                ₹{total.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handlePlaceOrder}
                        className="w-full bg-[#C8A962] text-black py-4 rounded-lg font-semibold"
                    >
                        Place Order
                    </button>
                </div>

            </div>
        </div>
    );
};
