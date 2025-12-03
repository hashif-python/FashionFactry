import { useState } from "react";
import { protectedPost } from "../lib/protectedApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const AddMoneyPage = () => {
    const [amount, setAmount] = useState("");
    const navigate = useNavigate();

    const handleAddMoney = async () => {
        if (!amount || Number(amount) <= 0) {
            toast.error("Enter a valid amount");
            return;
        }

        // 1️⃣ Create Razorpay Order
        const res = await protectedPost(
            "wallet/topup/create-order/",
            { amount },
            navigate
        );

        if (!res) return;

        const { order_id, amount: razorAmount, key_id } = res;

        const options = {
            key: key_id,
            amount: razorAmount,
            currency: "INR",
            order_id,
            name: "Wallet Top-up",
            handler: async function (response: any) {
                // 2️⃣ Verify payment on backend
                const verifyRes = await protectedPost(
                    "wallet/topup/verify/",
                    {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        amount,
                    },
                    navigate
                );

                if (verifyRes) {
                    toast.success("Money added to wallet");
                    navigate("/wallet");
                }
            },
            theme: { color: "#C8A962" },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
    };

    return (
        <div className="min-h-screen p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">Add Money</h1>

            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-md">
                <label className="text-white/80">Enter Amount</label>
                <input
                    type="number"
                    className="w-full mt-2 p-3 rounded-lg text-black"
                    placeholder="100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />

                <button
                    onClick={handleAddMoney}
                    className="w-full mt-5 bg-yellow-400 text-black py-3 rounded-lg font-semibold"
                >
                    Add Money
                </button>
            </div>
        </div>
    );
};
