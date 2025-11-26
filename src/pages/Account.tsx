import { useState, useEffect } from "react";
import { User, Phone, Mail } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../lib/api";
import { useNavigate } from "react-router-dom";

export const Account = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from Django /me
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await apiFetch("/me", { method: "GET" });
      setProfile(data?.user || data);
    } catch (err) {
      console.error("Failed to load /me", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-white/70">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/80 mb-4">Please log in to view your profile</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-[#C8A962] rounded-lg text-white font-semibold"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-10">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Profile */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="text-sm text-white/70">Full Name</p>
                  <p className="font-semibold text-white">{profile.first_name || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="text-sm text-white/70">Email</p>
                  <p className="font-semibold text-white">{profile.email || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="text-sm text-white/70">Phone</p>
                  <p className="font-semibold text-white">{profile.mobile || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/orders")}
                className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:border-[#C8A962]"
              >
                <p className="font-semibold text-white">My Orders</p>
                <p className="text-sm text-white/80">View your order history</p>
              </button>

              <button
                onClick={() => navigate("/cart")}
                className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:border-[#C8A962]"
              >
                <p className="font-semibold text-white">Shopping Cart</p>
                <p className="text-sm text-white/80">View items in your cart</p>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
              >
                <p className="font-semibold">Logout</p>
                <p className="text-sm">Sign out of your account</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
