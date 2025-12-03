import { useState } from "react";
import { apiFetch } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { toE164 } from "../lib/phone";

const COUNTRY_CODES = [
  { code: "91", name: "IN (+91)" },
  { code: "1", name: "USA (+1)" },
  { code: "971", name: "UAE (+971)" },
  { code: "44", name: "UK (+44)" },
  { code: "61", name: "Australia (+61)" },
  { code: "65", name: "Singapore (+65)" },
];

export const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    countryCode: "91",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const fullNumber = toE164(form.countryCode, form.phone); // +91XXXXXXXXXX

  /* ----------------------------------------------------------
     UPDATED VALIDATION
     - Email is OPTIONAL
     - Phone must be valid
     - Full Name required
     ----------------------------------------------------------- */
  const validate = () => {
    const e: any = {};

    if (!form.fullName.trim()) e.fullName = "Full name required";

    // Email optional → validate only if provided
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Invalid email";

    if (form.phone.replace(/\D/g, "").length < 7)
      e.phone = "Invalid phone";

    if (form.password.length < 6)
      e.password = "Min 6 characters";

    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError("");


    if (!validate()) return;

    setLoading(true);
    try {
      // Save temp user data for OTP screen
      sessionStorage.setItem("ff_full_name", form.fullName);
      sessionStorage.setItem("ff_email", form.email);
      sessionStorage.setItem("ff_phone", fullNumber);
      sessionStorage.setItem("ff_password", form.password);

      // ⭐ FIXED: Correct backend endpoint "otp-init/"
      await apiFetch("otp-init/", {
        method: "POST",
        body: JSON.stringify({
          email: form.email || null,     // Email optional
          mobile: fullNumber,            // E.164 number
        }),
      });

      navigate("/verify-otp/");
    } catch (err: any) {
      setServerError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white/10 backdrop-blur p-8 rounded-lg">
        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>

        {serverError && (
          <p className="p-3 bg-red-200 text-red-900 rounded-md">
            {serverError}
          </p>
        )}

        <form onSubmit={submit} className="space-y-4">

          {/* Full Name */}
          <div>
            <input
              placeholder="Full Name"
              value={form.fullName}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
              className="w-full p-3 rounded-md"
            />
            {errors.fullName && (
              <p className="text-red-400 text-sm">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              placeholder="Email (Optional)"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full p-3 rounded-md"
            />
            {errors.email && (
              <p className="text-red-400 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Phone with Country Code */}
          <div>
            <label className="text-white text-sm mb-1 block">Mobile Number</label>

            <div className="flex gap-2">

              {/* Country code */}
              <select
                value={form.countryCode}
                onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                className="w-20 p-3 rounded-md bg-white text-black border border-gray-300 focus:ring-2 focus:ring-[#C8A962] focus:outline-none"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>

              {/* Phone input */}
              <input
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })
                }
                className="flex-1 p-3 rounded-md bg-white text-black border border-gray-300 focus:ring-2 focus:ring-[#C8A962] focus:outline-none"
              />
            </div>

            {errors.phone && (
              <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
            )}

            <p className="text-white/70 text-xs mt-1">
              Full Number: <span className="font-semibold">{fullNumber}</span>
            </p>
          </div>

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="w-full p-3 rounded-md"
          />

          {/* Confirm Password */}
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              className="w-full p-3 rounded-md"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm">
                {errors.confirmPassword}
              </p>
            )}
            {errors.password && (
              <p className="text-red-400 text-sm">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C8A962] p-3 text-white rounded-md"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="text-white text-center mt-4">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-[#C8A962]"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};
