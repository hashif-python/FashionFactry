import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const VerifyOtp = ({ onNavigate }) => {
    const { verifyOtp } = useAuth();
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const email = sessionStorage.getItem("ff_email");
    const phone = sessionStorage.getItem("ff_phone");

    const target = email || phone;

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { error: err } = await verifyOtp(target, otp);

        if (err) {
            setError(err.message);
            setLoading(false);
        } else {
            navigate("/", { replace: true });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12">
            <div className="max-w-md w-full bg-white/10 backdrop-blur p-8 rounded-lg">
                <h2 className="text-3xl font-bold text-white mb-3">Verify OTP</h2>
                <p className="text-white/70 mb-2">
                    Enter the code sent to:
                </p>

                <p className="text-[#C8A962] font-semibold mb-4">
                    {target}
                </p>

                {error && (
                    <p className="p-3 bg-red-200 text-red-900 rounded-md">{error}</p>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        className="w-full p-3 rounded-md"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#C8A962] p-3 rounded-md text-white"
                    >
                        {loading ? "Verifying..." : "Verify"}
                    </button>
                </form>

                <p className="text-center text-white mt-4">
                    <button
                        className="text-[#C8A962]"
                        onClick={() => onNavigate("signup")}
                    >
                        Change Number / Email
                    </button>
                </p>
            </div>
        </div>
    );
};
