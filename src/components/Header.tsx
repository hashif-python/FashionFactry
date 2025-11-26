import { useEffect, useState, useRef } from "react";
import { ShoppingCart, User, Search, Menu, X, Heart } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  cartItemCount: number;
  wishlistCount: number;
}

export const Header = ({ cartItemCount, wishlistCount }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userMenuRef = useRef<HTMLDivElement | null>(null);

  /* ─── Scroll Background Effect ───────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ─── Auto-close dropdown when clicking outside ─────────── */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  /* ─── Smooth animated dropdown styles ───────────────────── */
  const dropdownBase =
    "absolute right-0 mt-3 w-56 rounded-xl bg-white shadow-2xl border border-gray-200 overflow-hidden z-[1000] animate-fade-slide-down";

  const dropdownItem =
    "px-4 py-3 text-left w-full hover:bg-gray-100 text-gray-800 transition-all flex flex-col";

  const headerBg = scrolled || mobileMenuOpen ? "bg-[#2D5550] shadow-md" : "bg-transparent";

  /* ─── Logout ─────────────────────────────────────────────── */
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      {/* HEADER */}
      <header className={`sticky top-0 z-[999] ${headerBg} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* BRAND */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <img src="/logo_smooth_128.png" className="h-12 w-auto" />
                <span className="text-2xl font-bold text-[#C8A962]">FashionFactry</span>
              </button>

              {/* Desktop Menu */}
              <nav className="hidden md:flex gap-8">
                <button onClick={() => navigate("/")} className="text-white/90 hover:text-[#C8A962]">Home</button>
                <button onClick={() => navigate("/watches")} className="text-white/90 hover:text-[#C8A962]">Watches</button>
                <button onClick={() => navigate("/shoes")} className="text-white/90 hover:text-[#C8A962]">Shoes</button>
                <button onClick={() => navigate("/spectacles")} className="text-white/90 hover:text-[#C8A962]">Spectacles</button>
              </nav>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-3">

              <Search className="hidden sm:block w-5 h-5 text-white cursor-pointer" />

              <div className="hidden sm:block cursor-pointer" onClick={() => navigate("/wishlist")}>
                <Heart className="w-5 h-5 text-white" />
                {wishlistCount > 0 && (
                  <span className="absolute bg-[#C8A962] text-white text-xs rounded-full px-2 py-1 -mt-6 ml-4">
                    {wishlistCount}
                  </span>
                )}
              </div>

              <div className="cursor-pointer relative" onClick={() => navigate("/cart")}>
                <ShoppingCart className="w-5 h-5 text-white" />
                {cartItemCount > 0 && (
                  <span className="absolute bg-[#C8A962] text-white text-xs rounded-full px-2 py-1 -mt-6 ml-4">
                    {cartItemCount}
                  </span>
                )}
              </div>

              {/* ─── USER DROPDOWN ───────────────────────────── */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <User
                    className="w-6 h-6 text-white cursor-pointer"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  />

                  {userMenuOpen && (
                    <div className={dropdownBase}>
                      <button
                        onClick={() => {
                          navigate("/account");
                          setUserMenuOpen(false);
                        }}
                        className={dropdownItem}
                      >
                        <span className="font-semibold">My Account</span>
                        <span className="text-xs text-gray-500">View profile details</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate("/orders");
                          setUserMenuOpen(false);
                        }}
                        className={dropdownItem}
                      >
                        <span className="font-semibold">Orders</span>
                        <span className="text-xs text-gray-500">Your order history</span>
                      </button>

                      <button
                        onClick={() => {
                          handleSignOut();
                          setUserMenuOpen(false);
                        }}
                        className={`${dropdownItem} text-red-600`}
                      >
                        <span className="font-semibold">Logout</span>
                        <span className="text-xs text-gray-500">Sign out safely</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <User className="w-6 h-6 text-white cursor-pointer" onClick={() => navigate("/login")} />
              )}

              {/* ─── MOBILE NAV BUTTON ─────────────────────── */}
              <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-[998]" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* MOBILE MENU PANEL */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1A3A35] fixed top-20 left-0 w-full z-[999] p-4 animate-fade-slide-down">
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => navigate("/watches")}>Watches</button>
          <button onClick={() => navigate("/shoes")}>Shoes</button>
          <button onClick={() => navigate("/spectacles")}>Spectacles</button>
          <button onClick={() => navigate("/wishlist")}>Wishlist</button>
        </div>
      )}
    </>
  );
};
