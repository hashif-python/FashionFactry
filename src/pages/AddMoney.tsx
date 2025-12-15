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

        // Step 1 → Create Cashfree Wallet Top-up order
        const res = await protectedPost(
            "wallet/topup/create-order/",
            { amount },
            navigate
        );

        if (!res?.payment_session_id) {
            toast.error("Failed to create top-up order");
            return;
        }

        const { payment_session_id, cashfree_order_id } = res;

        // Step 2 → Load Cashfree SDK
        if (!window.Cashfree) {
            toast.error("Cashfree SDK not loaded");
            return;
        }

        const cashfree = window.Cashfree({ mode: "production" });

        const options = {
            paymentSessionId: payment_session_id,
            redirectTarget: "_modal",
        };

        // Step 3 → Open Cashfree popup
        cashfree.checkout(options).then(async (result: any) => {
            console.log("Wallet Top-up Result →", result);

            // Step 4 → Verify wallet payment
            const verifyRes = await protectedPost(
                "wallet/topup/verify/",
                {
                    cashfree_order_id,
                    amount
                },
                navigate
            );

            if (verifyRes?.status === "success") {
                toast.success("Money added to wallet");
                navigate("/wallet");
            } else {
                toast.error("Wallet top-up failed");
            }
        });
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
