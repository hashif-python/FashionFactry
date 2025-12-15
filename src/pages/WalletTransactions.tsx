import { useEffect, useState } from "react";
import { protectedGet } from "../lib/protectedApi";
import { useNavigate } from "react-router-dom";
import { ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";

export const WalletTransactionsPage = () => {
    const [txns, setTxns] = useState([]);
    const navigate = useNavigate();

    const loadTxns = async () => {
        const res = await protectedGet("wallet/transactions/", navigate);
        if (res) setTxns(res);
    };

    useEffect(() => {
        loadTxns();
    }, []);

    return (
        <div className="min-h-screen p-6 text-white">

            {/* Header with Go to Wallet Link */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Transactions</h1>

                <button
                    onClick={() => navigate("/wallet")}
                    className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold"
                >
                    <Wallet className="w-5 h-5" />
                    Wallet
                </button>
            </div>

            {txns.length === 0 ? (
                <p className="text-white/60">No transactions found</p>
            ) : (
                <div className="space-y-4">
                    {txns.map((t: any) => (
                        <div
                            key={t.id}
                            className="bg-white/10 rounded-xl p-4 backdrop-blur-md flex justify-between"
                        >
                            <div>
                                <p className="font-semibold">{t.reason}</p>
                                <p className="text-sm text-white/60">
                                    {new Date(t.created_at).toLocaleString()}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {t.type === "credit" ? (
                                    <ArrowDownCircle className="w-6 h-6 text-green-400" />
                                ) : (
                                    <ArrowUpCircle className="w-6 h-6 text-red-400" />
                                )}

                                <p
                                    className={`text-xl font-bold ${t.type === "credit"
                                        ? "text-green-400"
                                        : "text-red-400"
                                        }`}
                                >
                                    {t.type === "credit" ? "+" : "-"} ₹{t.amount}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
