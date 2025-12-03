import { useEffect, useState, useRef } from "react";
import { ShoppingCart, User, Search, Menu, X, Heart, Home, Grid } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const Header = () => {
  const navigate = useNavigate();
  const { user, logout, wishlistCount, cartCount } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userMenuRef = useRef<HTMLDivElement | null>(null);

  /* ─── Add Background on Scroll ───────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ─── Close User Menu When Clicking Outside ─────── */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const headerBg = scrolled || mobileMenuOpen ? "bg-[#2D5550] shadow-md" : "bg-transparent";

  const handleSignOut = async () => {
    await logout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const IconWithLabel = ({ title, onClick, children }) => (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center w-10 h-10 group"
    >
      {children}
      <span className="hidden sm:block text-[11px] text-white/70 opacity-0 group-hover:opacity-100 transition whitespace-nowrap mt-1">
        {title}
      </span>
    </button>
  );

  /* ─────────────────────────────────────────────── */
  /*                     HEADER                      */
  /* ─────────────────────────────────────────────── */
  return (
    <>
      <header className={`sticky top-0 z-[999] ${headerBg} transition duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between items-center h-20">

            {/* LOGO & BRAND (brand hidden on mobile) */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:opacity-80 transition"
            >
              <img src="/logo_smooth_128.png" className="h-8 w-auto sm:h-12" />
              <span className="hidden sm:inline text-xl sm:text-2xl font-bold text-[#C8A962] tracking-wide">
                FashionFactry
              </span>
            </button>

            {/* DESKTOP NAVIGATION */}
            <nav className="hidden md:flex gap-8">
              <button onClick={() => navigate("/")} className="text-white/90 hover:text-[#C8A962]">
                Home
              </button>
              <button onClick={() => navigate("/watches")} className="text-white/90 hover:text-[#C8A962]">
                Watches
              </button>
              <button onClick={() => navigate("/shoes")} className="text-white/90 hover:text-[#C8A962]">
                Shoes
              </button>
              <button onClick={() => navigate("/spectacles")} className="text-white/90 hover:text-[#C8A962]">
                Spectacles
              </button>
            </nav>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-2 sm:gap-3">

              <IconWithLabel title="Search" onClick={() => { }}>
                <Search className="w-5 h-5 text-white" />
              </IconWithLabel>

              {/* Wishlist */}
              <IconWithLabel title="Wishlist" onClick={() => navigate("/wishlist")}>
                <div className="relative">
                  <Heart className="w-5 h-5 text-white" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#C8A962] text-white text-[10px] rounded-full px-1.5">
                      {wishlistCount}
                    </span>
                  )}
                </div>
              </IconWithLabel>

              {/* Cart */}
              <IconWithLabel title="Cart" onClick={() => navigate("/cart")}>
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-white" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#C8A962] text-white text-[10px] rounded-full px-1.5">
                      {cartCount}
                    </span>
                  )}
                </div>
              </IconWithLabel>

              {/* ACCOUNT MENU */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <IconWithLabel title="Account">
                    <User
                      className="w-6 h-6 text-white cursor-pointer"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                    />
                  </IconWithLabel>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden z-[1000]">
                      <button
                        onClick={() => { navigate("/account"); setUserMenuOpen(false); }}
                        className="px-4 py-3 hover:bg-gray-100 w-full text-left"
                      >
                        My Account
                      </button>

                      <button
                        onClick={() => { navigate("/orders"); setUserMenuOpen(false); }}
                        className="px-4 py-3 hover:bg-gray-100 w-full text-left"
                      >
                        Orders
                      </button>

                      <button
                        onClick={handleSignOut}
                        className="px-4 py-3 hover:bg-gray-100 w-full text-left text-red-600"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <IconWithLabel title="Login" onClick={() => navigate("/login")}>
                  <User className="w-6 h-6 text-white cursor-pointer" />
                </IconWithLabel>
              )}

              {/* MOBILE MENU BUTTON */}
              <button
                className="flex md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-7 h-7 text-white" />
                ) : (
                  <Menu className="w-7 h-7 text-white" />
                )}
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1A3A35] fixed top-20 left-0 w-full z-[999] p-4 space-y-2">
          <button className="block text-white py-3 text-lg" onClick={() => navigate("/")}>
            Home
          </button>
          <button className="block text-white py-3 text-lg" onClick={() => navigate("/watches")}>
            Watches
          </button>
          <button className="block text-white py-3 text-lg" onClick={() => navigate("/shoes")}>
            Shoes
          </button>
          <button className="block text-white py-3 text-lg" onClick={() => navigate("/spectacles")}>
            Spectacles
          </button>
          {user && (
            <button className="block text-white py-3 text-lg" onClick={() => navigate("/orders")}>
              Orders
            </button>
          )}
          <button className="block text-white py-3 text-lg" onClick={() => navigate("/wishlist")}>
            Wishlist
          </button>
        </div>
      )}

      {/* ---------------------------------------------------------- */}
      {/*                   MOBILE BOTTOM NAVIGATION                */}
      {/* ---------------------------------------------------------- */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#2D5550] sm:hidden z-[998] border-t border-white/20">
        <div className="flex justify-around py-3">

          <button className="flex flex-col items-center text-white" onClick={() => navigate("/")}>
            <Home className="w-6 h-6" />
            <span className="text-[11px] mt-1">Home</span>
          </button>

          <button className="flex flex-col items-center text-white" onClick={() => navigate("/watches")}>
            <Grid className="w-6 h-6" />
            <span className="text-[11px] mt-1">Categories</span>
          </button>

          <button className="relative flex flex-col items-center text-white" onClick={() => navigate("/wishlist")}>
            <Heart className="w-6 h-6" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 right-2 bg-[#C8A962] text-white text-[10px] rounded-full px-1.5">
                {wishlistCount}
              </span>
            )}
            <span className="text-[11px] mt-1">Wishlist</span>
          </button>

          <button className="relative flex flex-col items-center text-white" onClick={() => navigate("/cart")}>
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 right-2 bg-[#C8A962] text-white text-[10px] rounded-full px-1.5">
                {cartCount}
              </span>
            )}
            <span className="text-[11px] mt-1">Cart</span>
          </button>

          <button className="flex flex-col items-center text-white" onClick={() => navigate("/account")}>
            <User className="w-6 h-6" />
            <span className="text-[11px] mt-1">{user ? "Profile" : "Login"}</span>
          </button>
        </div>
      </nav>
    </>
  );
};
