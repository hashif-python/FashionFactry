import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, setLoggingOut } from "../lib/api";

interface AuthContextType {
  user: any;
  loading: boolean;
  logout: () => Promise<void>;
  signIn: (mobile: string, password: string) => Promise<{ error?: any }>;
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

  function getWishlistCount(wl: any): number {
    if (!wl) return 0;
    if (Array.isArray(wl)) return wl.length;
    if (wl.items && Array.isArray(wl.items)) return wl.items.length;
    if (wl.wishlist_id) return 1;
    return 0;
  }

  function getCartCount(cart: any): number {
    if (!cart) return 0;
    if (Array.isArray(cart)) return cart.length;
    if (cart.items && Array.isArray(cart.items)) return cart.items.length;
    if (cart.cart_id) return 1;
    return 0;
  }

  const reloadCounts = async () => {
    try {
      const wl = await apiFetch("wishlist/");
      setWishlistCount(getWishlistCount(wl));

      const cart = await apiFetch("cart/");
      setCartCount(getCartCount(cart));
    } catch { }
  };

  // INITIAL LOAD
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

  /* ----------------------------
       LOGOUT (fixed)
  ----------------------------- */
  const logout = async () => {
    setLoggingOut(true);

    setUser(null);

    try {
      await apiFetch("logout/", { method: "POST" });
    } catch { }

    // Stop refresh loops
    window.localStorage.setItem("force_logout", "1");

    window.location.replace("/login");
  };

  /* ----------------------------
       LOGIN FIX — return {error}
  ----------------------------- */
  const signIn = async (mobile: string, password: string) => {
    console.log("Signing in with:", mobile, password);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        signIn,
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
