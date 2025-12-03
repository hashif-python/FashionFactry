import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, apiPost, setLoggingOut } from "../lib/api";

interface AuthContextType {
  user: any;
  loading: boolean;
  logout: () => Promise<void>;
  signIn: (mobile: string, password: string) => Promise<{ error?: any }>;

  // ⭐ Added
  verifyOtp: (payload: any) => Promise<{ data?: any; error?: any }>;
  resendOtp: (payload: any) => Promise<{ data?: any; error?: any }>;
  setUser: (u: any) => void;

  wishlistCount: number;
  cartCount: number;
  setWishlistCount: (n: number) => void;
  setCartCount: (n: number) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => { },
  signIn: async () => ({ error: null }),

  verifyOtp: async () => ({ error: null }),
  resendOtp: async () => ({ error: null }),
  setUser: () => { },

  wishlistCount: 0,
  cartCount: 0,
  setWishlistCount: () => { },
  setCartCount: () => { },
});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  /* -------------------------------------------
      GET COUNTS
  ------------------------------------------- */
  const reloadCounts = async () => {
    try {
      const wl = await apiFetch("wishlist/");
      const cart = await apiFetch("cart/");

      setWishlistCount(Array.isArray(wl) ? wl.length : wl?.items?.length || 0);
      setCartCount(Array.isArray(cart) ? cart.length : cart?.items?.length || 0);
    } catch { }
  };

  /* -------------------------------------------
      LOAD USER INITIALLY
  ------------------------------------------- */
  useEffect(() => {
    const init = async () => {
      try {
        const me = await apiFetch("me/");
        setUser(me);
        await reloadCounts();
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  /* -------------------------------------------
      LOGOUT
  ------------------------------------------- */
  const logout = async () => {
    setLoggingOut(true);
    setUser(null);

    try {
      await apiFetch("logout/", { method: "POST" });
    } catch { }

    window.location.replace("/login");
  };

  /* -------------------------------------------
      LOGIN
  ------------------------------------------- */
  const signIn = async (mobile: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiFetch("login/", {
        method: "POST",
        body: JSON.stringify({ mobile, password }),
      });

      setUser(data.user || data);
      await reloadCounts();
      return { error: null };

    } catch (e: any) {
      return { error: e };
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------
      ⭐ VERIFY OTP (NEW)
  ------------------------------------------- */
  const verifyOtp = async (payload: any) => {
    try {
      const data = await apiPost("verify-otp/", payload);
      return { data, error: null };
    } catch (e: any) {
      return { error: e };
    }
  };

  /* -------------------------------------------
      ⭐ RESEND OTP (NEW)
  ------------------------------------------- */
  const resendOtp = async (payload: any) => {
    try {
      const data = await apiPost("resend-otp/", payload);
      return { data, error: null };
    } catch (e: any) {
      return { error: e };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        signIn,

        verifyOtp,
        resendOtp,
        setUser,

        wishlistCount,
        cartCount,
        setWishlistCount,
        setCartCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
