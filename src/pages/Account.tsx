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

  // Edit Mode States
  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  /* ------------------------------
       LOAD PROFILE /me
  ------------------------------ */
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await apiFetch("/me/", { method: "GET" });
      const u = data?.user || data;
      setProfile(u);

      // Pre-fill edit fields
      setFirstName(u.first_name || "");
      setMobile(u.mobile || "");
      setEmail(u.email || "");

    } catch (err) {
      console.error("Failed to load /me", err);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------
       LOGOUT
  ------------------------------ */
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  /* ------------------------------
       SAVE PROFILE
  ------------------------------ */
  const handleSave = async () => {
    if (!firstName.trim()) {
      alert("Full name is required");
      return;
    }
    if (!email.trim()) {
      alert("Email is required");
      return;
    }
    if (!mobile.trim()) {
      alert("Phone number is required");
      return;
    }

    setSaving(true);

    try {
      const updated = await apiFetch("/me/", {
        method: "PUT",
        body: JSON.stringify({
          first_name: firstName,
          email: email,
          mobile: mobile,
        }),
      });

      // Update UI
      setProfile(updated);
      setEditMode(false);

    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to update profile");
    }

    setSaving(false);
  };

  /* ------------------------------
       LOADING SCREEN
  ------------------------------ */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-white/70">Loading...</p>
      </div>
    );
  }

  /* ------------------------------
       NO PROFILE / NOT LOGGED
  ------------------------------ */
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

  /* ------------------------------
       MAIN UI
  ------------------------------ */
  return (
    <div className="min-h-screen bg-transparent py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-white">My Account</h1>

          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="px-5 py-2 bg-[#C8A962] text-white rounded-lg"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* LEFT — VIEW/EDIT PROFILE */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">

            <h2 className="text-2xl font-bold text-white mb-6">
              {editMode ? "Edit Profile" : "Profile Information"}
            </h2>

            {!editMode ? (
              <div className="space-y-4">

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-300" />
                  <div>
                    <p className="text-sm text-white/70">Full Name</p>
                    <p className="font-semibold text-white">{profile.first_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-300" />
                  <div>
                    <p className="text-sm text-white/70">Email</p>
                    <p className="font-semibold text-white">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-300" />
                  <div>
                    <p className="text-sm text-white/70">Phone</p>
                    <p className="font-semibold text-white">{profile.mobile}</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="space-y-5">

                <div>
                  <label className="text-sm text-white/70">Full Name</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 w-full p-2 rounded-lg bg-white text-black"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/70">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full p-2 rounded-lg bg-white text-black"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/70">Phone</label>
                  <input
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    className="mt-1 w-full p-2 rounded-lg bg-white text-black"
                  />
                </div>

                {/* Save & Cancel */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-[#C8A962] text-white rounded-lg"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    onClick={() => {
                      setEditMode(false);
                      setFirstName(profile.first_name);
                      setEmail(profile.email);
                      setMobile(profile.mobile);
                    }}
                    className="px-6 py-2 bg-gray-300 text-black rounded-lg"
                  >
                    Cancel
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* RIGHT — QUICK ACTIONS */}
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
                onClick={() => navigate("/address")}
                className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:border-[#C8A962]"
              >
                <p className="font-semibold text-white">My Addresses</p>
                <p className="text-sm text-white/80">Manage your saved addresses</p>
              </button>

              <button
                onClick={() => navigate("/wallet")}
                className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:border-[#C8A962]"
              >
                <p className="font-semibold text-white">My Wallet</p>
                <p className="text-sm text-white/80">View and manage your wallet balance</p>
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
