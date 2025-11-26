import { useState } from "react";
import { apiFetch } from "../lib/api";

export const Signup = ({ onNavigate }) => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: any = {};
    if (!form.fullName.trim()) e.fullName = "Full name required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (form.phone.replace(/\D/g, "").length < 10) e.phone = "Invalid phone";
    if (form.password.length < 6) e.password = "Min 6 characters";
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
      sessionStorage.setItem("ff_full_name", form.fullName);
      sessionStorage.setItem("ff_email", form.email);
      sessionStorage.setItem("ff_phone", form.phone);
      sessionStorage.setItem("ff_password", form.password);

      await apiFetch("otp-init", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          mobile: form.phone,
        }),
      });

      onNavigate("verify-otp");
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
          <input
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full p-3 rounded-md"
          />
          {errors.fullName && (
            <p className="text-red-400 text-sm">{errors.fullName}</p>
          )}

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full p-3 rounded-md"
          />
          {errors.email && (
            <p className="text-red-400 text-sm">{errors.email}</p>
          )}

          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full p-3 rounded-md"
          />
          {errors.phone && (
            <p className="text-red-400 text-sm">{errors.phone}</p>
          )}

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full p-3 rounded-md"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            className="w-full p-3 rounded-md"
          />

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
            onClick={() => onNavigate("login")}
            className="text-[#C8A962]"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};
