import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import toast from "react-hot-toast";

export const ResetPassword = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const token = params.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!token) {
            setError("Invalid or missing reset token");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            await apiPost("password/reset/", {
                token,
                password,
            });

            toast.success("Password updated successfully");
            navigate("/login");
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                "Invalid or expired reset link"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <form
                onSubmit={submit}
                className="max-w-md w-full bg-white/10 p-8 rounded-lg backdrop-blur"
            >
                <h2 className="text-2xl font-bold text-white mb-4 text-center">
                    Reset Password
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-200 text-red-900 rounded-md text-sm">
                        {error}
                    </div>
                )}

                {/* New Password */}
                <div className="mb-4">
                    <label className="block text-white text-sm mb-1">
                        New Password
                    </label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 rounded-md"
                        placeholder="Enter new password"
                    />
                </div>

                {/* Confirm Password */}
                <div className="mb-6">
                    <label className="block text-white text-sm mb-1">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-3 rounded-md"
                        placeholder="Re-enter new password"
                    />
                </div>

                <button
                    disabled={loading}
                    className="w-full bg-[#C8A962] py-3 rounded-lg font-semibold disabled:opacity-60"
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>

                <p className="text-xs text-white/70 mt-4 text-center">
                    Make sure you remember your new password before continuing.
                </p>
            </form>
        </div>
    );
};
