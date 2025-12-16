import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toE164 } from "../lib/phone";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import axios from 'axios';

const COUNTRY_CODES = [
  { code: "91", name: "India (+91)" },
  { code: "1", name: "USA (+1)" },
  { code: "971", name: "UAE (+971)" },
  { code: "44", name: "UK (+44)" },
  { code: "61", name: "Australia (+61)" },
  { code: "65", name: "Singapore (+65)" },
];

export const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [countryCode, setCountryCode] = useState("91");
  const [localPhone, setLocalPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fullNumber = toE164(countryCode, localPhone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!localPhone.trim()) return setError("Phone number is required");
    if (!password.trim()) return setError("Password is required");
    if (!fullNumber || fullNumber.length < 7)
      return setError("Enter a valid phone number");

    setLoading(true);
    const { error: loginError } = await signIn(fullNumber, password);

    if (loginError) {
      setError("Invalid phone or password");
      toast.error("Login failed");
      setLoading(false);
      return;
    }

    toast.success("Logged in successfully!");
    setTimeout(() => navigate("/", { replace: true }), 150);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white/10 p-6 sm:p-8 rounded-lg backdrop-blur">

        <h2 className="text-3xl font-bold text-white mb-4 text-center">
          Login
        </h2>

        {error && (
          <p className="p-3 bg-red-300 text-red-900 rounded-md text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">

          {/* Phone Number */}
          <div>
            <label className="text-white text-sm mb-1 block">Mobile Number</label>

            <div className="flex gap-2 flex-col sm:flex-row">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                disabled={loading}
                className="w-full sm:w-40 p-2 rounded-md bg-white text-black"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                type="tel"
                value={localPhone}
                disabled={loading}
                onChange={(e) =>
                  setLocalPhone(e.target.value.replace(/\D/g, ""))
                }
                placeholder="9876543210"
                className="w-full p-2 rounded-md bg-white text-black"
              />
            </div>

            <p className="text-white/70 text-xs mt-1 break-all">
              Login as: <span className="font-semibold">{fullNumber}</span>
            </p>
          </div>

          {/* Password */}
          <div className="relative">
            <label className="text-white text-sm mb-1 block">Password</label>

            <input
              type={showPwd ? "text" : "password"}
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2 rounded-md bg-white text-black"
            />

            <button
              type="button"
              disabled={loading}
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-2 top-9 text-xs text-black"
            >
              {showPwd ? "Hide" : "Show"}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C8A962] text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <div className="mt-6">
          <GoogleLogin
            onSuccess={async (cred) => {
              try {
                await axios.post(
                  "/auth/google/",
                  { token: cred.credential },
                  { withCredentials: true }
                );

                toast.success("Logged in with Google");
                navigate("/", { replace: true });
              } catch (err) {
                toast.error("Google login failed");
              }
            }}
            onError={() => {
              toast.error("Google login failed");
            }}
          />
        </div>


        <p className="text-white mt-6 text-center">
          Don’t have an account?{" "}
          <button
            disabled={loading}
            className="text-[#C8A962]"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </p>

      </div>
    </div>
  );
};
