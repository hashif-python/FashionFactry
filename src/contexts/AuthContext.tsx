import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiFetch, apiPost, bindGlobalLoader } from "../lib/api";
import { useApiLoader } from "./ApiLoaderContext";

interface AuthContextType {
  user: any;
  loading: boolean;
  logout: () => Promise<void>;
  signIn: (mobile: string, password: string) => Promise<{ error?: any }>;

  verifyOtp: (payload: any) => Promise<{ data?: any; error?: any }>;
  resendOtp: (payload: any) => Promise<{ data?: any; error?: any }>;
  resetPassword: (email: string) => Promise<{ error?: any }>;

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
  resetPassword: async () => ({ error: null }),

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

  // 🔥 GLOBAL API LOADER BIND
  const { start, stop } = useApiLoader();

  useEffect(() => {
    bindGlobalLoader(start, stop);
  }, [start, stop]);

  /* -------------------------------------------
      PARALLEL LOAD COUNTS (FAST)
  ------------------------------------------- */
  const reloadCounts = useCallback(async () => {
    try {
      const [wl, cart] = await Promise.all([
        apiFetch("wishlist/"),
        apiFetch("cart/")
      ]);

      setWishlistCount(Array.isArray(wl) ? wl.length : wl?.items?.length || 0);
      setCartCount(Array.isArray(cart) ? cart.length : cart?.items?.length || 0);
    } catch (e) {
      console.warn("Count load failed:", e);
    }
  }, []);

  /* -------------------------------------------
      INITIAL LOAD
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
  }, [reloadCounts]);

  /* -------------------------------------------
      LOGOUT
  ------------------------------------------- */
  const logout = async () => {
    try {
      await apiFetch("logout/", { method: "POST" });
    } catch { }

    setUser(null);
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
      OTP
  ------------------------------------------- */
  const verifyOtp = async (payload: any) => {
    try {
      const data = await apiPost("verify-otp/", payload);
      return { data, error: null };
    } catch (e: any) {
      return { error: e };
    }
  };

  const resendOtp = async (payload: any) => {
    try {
      const data = await apiPost("resend-otp/", payload);
      return { data, error: null };
    } catch (e: any) {
      return { error: e };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await apiPost("password/forgot/", { email });
      return { error: null };
    } catch (e: any) {
      return {
        error: {
          message:
            e?.response?.data?.message ||
            "Failed to send reset link",
        },
      };
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
        resetPassword,

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
