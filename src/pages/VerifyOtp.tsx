import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import toast from "react-hot-toast";

export const VerifyOtp = () => {
    const { verifyOtp, resendOtp, setUser } = useAuth();
    const navigate = useNavigate();

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");

    const [timer, setTimer] = useState(60);

    // DATA STORED DURING SIGNUP
    const fullName = sessionStorage.getItem("ff_full_name");
    const email = sessionStorage.getItem("ff_email");
    const phone = sessionStorage.getItem("ff_phone");
    const password = sessionStorage.getItem("ff_password");

    const target = email || phone;

    /* ------------------------------------
          Countdown timer for resend OTP
    -------------------------------------- */
    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    /* ------------------------------------
              Clear signup session
    -------------------------------------- */
    const clearSession = () => {
        sessionStorage.removeItem("ff_full_name");
        sessionStorage.removeItem("ff_email");
        sessionStorage.removeItem("ff_phone");
        sessionStorage.removeItem("ff_password");
    };

    /* ------------------------------------
                Submit OTP
    -------------------------------------- */
    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const payload = {
            email: email || null,
            mobile: phone || null,
            otp: otp,
        };
        console.log("verifyOtp:", verifyOtp);
        console.log("resendOtp:", resendOtp);
        console.log("setUser:", setUser);
        const { data, error: verifyError } = await verifyOtp(payload);

        if (verifyError) {
            setLoading(false);
            setError(verifyError.message || "OTP verification failed");
            toast.error("Invalid OTP");
            return;
        }

        // CASE A — Existing user → login success
        if (data?.user_exists) {
            setUser(data.user);
            clearSession();
            toast.success("OTP Verified");
            navigate("/", { replace: true });
            return;
        }

        // CASE B — New user → register automatically
        try {
            await apiPost("register/", {
                full_name: fullName,
                email,
                mobile: phone,
                password,
            });

            clearSession();

            toast.success("Account created successfully. You can now log in.");
            navigate("/login", { replace: true });

        } catch (err: any) {
            setError("Registration failed: " + err.message);
        }

        setLoading(false);
    };

    /* ------------------------------------
                Resend OTP
    -------------------------------------- */
    const handleResend = async () => {
        setResending(true);
        setError("");

        const payload = {
            email: email || null,
            mobile: phone || null,
        };

        const { error: resendError } = await resendOtp(payload);

        if (resendError) {
            setError(resendError.message || "Failed to resend OTP");
            toast.error("Failed to resend");
        } else {
            setTimer(60);
            toast.success("OTP sent again.");
        }

        setResending(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12">
            <div className="max-w-md w-full bg-white/10 backdrop-blur p-8 rounded-lg">

                <h2 className="text-3xl font-bold text-white mb-3">Verify OTP</h2>

                <p className="text-white/70 mb-2">Enter the code sent to:</p>
                <p className="text-[#C8A962] font-semibold mb-4">{target}</p>

                {error && (
                    <p className="p-3 bg-red-200 text-red-900 rounded-md">{error}</p>
                )}

                {/* OTP Input */}
                <form onSubmit={submit} className="space-y-4">
                    <input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        className="w-full p-3 rounded-md bg-white text-black border border-gray-300 focus:ring-2 focus:ring-[#C8A962] outline-none"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#C8A962] p-3 rounded-md text-white"
                    >
                        {loading ? "Verifying..." : "Verify"}
                    </button>
                </form>

                {/* Resend OTP */}
                <div className="text-center text-white mt-4">
                    {timer > 0 ? (
                        <p className="text-sm opacity-80">
                            Resend OTP in <span className="font-bold">{timer}s</span>
                        </p>
                    ) : (
                        <button
                            onClick={handleResend}
                            disabled={resending}
                            className="text-[#C8A962] font-semibold"
                        >
                            {resending ? "Sending..." : "Resend OTP"}
                        </button>
                    )}
                </div>

                {/* Change number/email */}
                <p className="text-center text-white mt-4">
                    <button
                        className="text-[#C8A962]"
                        onClick={() => navigate("/signup")}
                    >
                        Change Number / Email
                    </button>
                </p>
            </div>
        </div>
    );
};
