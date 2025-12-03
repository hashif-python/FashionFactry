import { useEffect, useState } from "react";
import { protectedGet } from "../lib/protectedApi";
import { useNavigate } from "react-router-dom";
import { Wallet, PlusCircle, History } from "lucide-react";

export const WalletPage = () => {
    const [balance, setBalance] = useState(0);
    const navigate = useNavigate();

    const loadBalance = async () => {
        const res = await protectedGet("wallet/", navigate);
        if (res) setBalance(res.balance);
    };

    useEffect(() => {
        loadBalance();
    }, []);

    return (
        <div className="min-h-screen p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">My Wallet</h1>

            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Wallet className="w-10 h-10 text-yellow-400" />
                    <div>
                        <p className="text-sm text-white/60">Available Balance</p>
                        <p className="text-4xl font-bold text-yellow-400">₹{balance}</p>
                    </div>
                </div>

                <div className="mt-6 flex gap-4">
                    <button
                        onClick={() => navigate("/wallet/add-money")}
                        className="flex-1 bg-yellow-400 text-black py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                        <PlusCircle className="w-5 h-5" /> Add Money
                    </button>

                    <button
                        onClick={() => navigate("/wallet/transactions")}
                        className="flex-1 bg-white/20 border border-white/30 backdrop-blur py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                        <History className="w-5 h-5" /> Transactions
                    </button>
                </div>
            </div>
        </div>
    );
};
