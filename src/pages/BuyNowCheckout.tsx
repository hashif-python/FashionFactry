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

    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showAddAddressForm, setShowAddAddressForm] = useState(false);

    // ---------------- COUPON ----------------
    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const [finalTotal, setFinalTotal] = useState<number | null>(null);
    const [applyingCoupon, setApplyingCoupon] = useState(false);


    const [newAddress, setNewAddress] = useState({
        full_name: "",
        phone: "",
        address_line: "",
        city: "",
        state: "",
        pincode: "",
    });


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

    const handleAddAddress = async (e: any) => {
        e.preventDefault();

        if (!newAddress.full_name.trim()) {
            toast.error("Full name is required");
            return;
        }

        if (!/^[6-9]\d{9}$/.test(newAddress.phone)) {
            toast.error("Enter valid phone number");
            return;
        }

        if (!/^\d{6}$/.test(newAddress.pincode)) {
            toast.error("Enter valid pincode");
            return;
        }

        const res = await protectedPost("address/", newAddress, navigate);
        if (!res) return;

        toast.success("Address added");
        setShowAddAddressForm(false);
        setNewAddress({
            full_name: "",
            phone: "",
            address_line: "",
            city: "",
            state: "",
            pincode: "",
        });

        loadAddresses();
    };

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

            const apiMessage =
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                err?.message ||
                "Invalid coupon";

            toast.error(apiMessage);
        } finally {
            setApplyingCoupon(false);
        }
    };

    const total =
        (variant.final_price || variant.price) * quantity;

    const baseTotal =
        (variant.final_price || variant.price) * quantity;

    const payableTotal = finalTotal !== null ? finalTotal : baseTotal;


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
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-xl font-semibold">Shipping Address</h2>

                        <button
                            onClick={() => setShowAddressModal(true)}
                            className="text-sm text-[#C8A962] underline"
                        >
                            Change Address
                        </button>
                    </div>


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
                            disabled={walletBalance < payableTotal}
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
                                ₹{payableTotal.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* COUPON SECTION */}
                    <div className="bg-white/10 p-4 rounded-xl mt-4">
                        <h3 className="text-lg font-semibold mb-2">Apply Coupon</h3>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                value={coupon}
                                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                                placeholder="COUPON CODE"
                                className="w-full sm:flex-1 p-3 rounded-lg text-black"
                            />

                            <button
                                type="button"
                                onClick={applyCoupon}
                                disabled={applyingCoupon}
                                className="
                                    w-full sm:w-auto
                                    px-5 py-3
                                    bg-white text-black
                                    rounded-lg font-semibold
                                    disabled:opacity-60
                                "
                            >
                                {applyingCoupon ? "Applying..." : "Apply"}
                            </button>
                        </div>

                        {discount > 0 && (
                            <div className="flex justify-between text-green-400 mt-2">
                                <span>Discount</span>
                                <span>- ₹{discount.toLocaleString()}</span>
                            </div>
                        )}
                    </div>


                    <button
                        onClick={handlePlaceOrder}
                        className="w-full bg-[#C8A962] text-black py-4 rounded-lg font-semibold"
                    >
                        Place Order
                    </button>
                </div>

            </div>
            {showAddressModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
                    <div className="bg-[#1A1A1A] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6">

                        {/* HEADER */}
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">
                                {showAddAddressForm ? "Add New Address" : "Select Address"}
                            </h3>
                            <button onClick={() => {
                                setShowAddressModal(false);
                                setShowAddAddressForm(false);
                            }}>
                                ✕
                            </button>
                        </div>

                        {/* ================= ADDRESS LIST ================= */}
                        {!showAddAddressForm && (
                            <>
                                {addresses.map((addr) => (
                                    <div
                                        key={addr.id}
                                        onClick={() => {
                                            setSelectedAddress(addr);
                                            setShowAddressModal(false);
                                        }}
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

                                <button
                                    onClick={() => setShowAddAddressForm(true)}
                                    className="w-full border border-[#C8A962] text-[#C8A962] py-2 rounded-lg mt-4"
                                >
                                    + Add New Address
                                </button>
                            </>
                        )}

                        {/* ================= ADD ADDRESS FORM ================= */}
                        {showAddAddressForm && (
                            <>
                                {/* BACK BUTTON */}
                                <button
                                    onClick={() => setShowAddAddressForm(false)}
                                    className="mb-4 text-sm text-[#C8A962] underline"
                                >
                                    ← Back to Address List
                                </button>

                                <form onSubmit={handleAddAddress} className="space-y-3">
                                    <input
                                        placeholder="Full Name"
                                        className="w-full p-3 rounded-lg bg-white/10"
                                        value={newAddress.full_name}
                                        onChange={(e) =>
                                            setNewAddress({ ...newAddress, full_name: e.target.value })
                                        }
                                    />

                                    <input
                                        placeholder="Phone"
                                        className="w-full p-3 rounded-lg bg-white/10"
                                        value={newAddress.phone}
                                        onChange={(e) =>
                                            setNewAddress({ ...newAddress, phone: e.target.value })
                                        }
                                    />

                                    <input
                                        placeholder="Address"
                                        className="w-full p-3 rounded-lg bg-white/10"
                                        value={newAddress.address_line}
                                        onChange={(e) =>
                                            setNewAddress({ ...newAddress, address_line: e.target.value })
                                        }
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input
                                            placeholder="City"
                                            className="p-3 rounded-lg bg-white/10"
                                            value={newAddress.city}
                                            onChange={(e) =>
                                                setNewAddress({ ...newAddress, city: e.target.value })
                                            }
                                        />
                                        <input
                                            placeholder="State"
                                            className="p-3 rounded-lg bg-white/10"
                                            value={newAddress.state}
                                            onChange={(e) =>
                                                setNewAddress({ ...newAddress, state: e.target.value })
                                            }
                                        />
                                    </div>

                                    <input
                                        placeholder="Pincode"
                                        className="w-full p-3 rounded-lg bg-white/10"
                                        value={newAddress.pincode}
                                        onChange={(e) =>
                                            setNewAddress({ ...newAddress, pincode: e.target.value })
                                        }
                                    />

                                    <button className="w-full bg-[#C8A962] text-black py-3 rounded-lg font-semibold">
                                        Save Address
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};
