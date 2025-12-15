import { useEffect, useState, useRef } from "react";
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  Heart,
  Home,
  Grid,
  Mail,
} from "lucide-react";
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

  /* -----------------------------------
     SHADOW ON SCROLL
  ----------------------------------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* -----------------------------------
     CLOSE PROFILE MENU ON OUTSIDE CLICK
  ----------------------------------- */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const headerBg =
    scrolled || mobileMenuOpen ? "bg-[#2D5550] shadow-md" : "bg-transparent";

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
      <span className="hidden sm:block text-[11px] text-white/70 opacity-0 group-hover:opacity-100 transition mt-1">
        {title}
      </span>
    </button>
  );

  return (
    <>
      {/* HEADER */}
      <header
        className={`sticky top-0 z-[999] ${headerBg} transition duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* MAIN ROW */}
          <div className="flex items-center h-20 w-full gap-4">

            {/* LOGO */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:opacity-80 transition"
            >
              <img src="/logo_smooth_128.png" className="h-8 w-auto sm:h-12" />
              <span className="text-base sm:text-2xl font-bold text-[#C8A962] tracking-wide">
                FashionFactry
              </span>
            </button>

            {/* SEARCH BAR — DESKTOP */}
            <div className="hidden md:flex items-center flex-1 justify-start max-w-xl ml-4 md:ml-6">
              <div className="relative w-full">
                <input
                  id="header-search-input"
                  type="text"
                  placeholder="Search products..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      navigate(`/search?q=${e.currentTarget.value}`);
                  }}
                  className="w-full px-4 py-2 pl-11 rounded-full text-black shadow-md focus:outline-none"
                />

                {/* SEARCH ICON */}
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer"
                  onClick={() => {
                    const value = (
                      document.querySelector(
                        "#header-search-input"
                      ) as HTMLInputElement
                    )?.value;
                    navigate(`/search?q=${value}`);
                  }}
                />
              </div>
            </div>

            {/* ICONS — DESKTOP */}
            <div className="hidden md:flex items-center gap-6 ml-auto pr-2">

              {/* Wishlist */}
              <IconWithLabel title="Wishlist" onClick={() => navigate("/wishlist")}>
                <div className="relative">
                  <Heart className="w-5 h-5 text-white" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#C8A962] text-[10px] text-white rounded-full px-1.5">
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
                    <span className="absolute -top-1 -right-1 bg-[#C8A962] text-[10px] text-white rounded-full px-1.5">
                      {cartCount}
                    </span>
                  )}
                </div>
              </IconWithLabel>

              {/* Account */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <IconWithLabel title="Account">
                    <User
                      className="w-6 h-6 text-white cursor-pointer"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                    />
                  </IconWithLabel>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-xl bg-white shadow-xl border">
                      <button
                        onClick={() => navigate("/account")}
                        className="px-4 py-3 hover:bg-gray-100 w-full text-left"
                      >
                        My Account
                      </button>
                      <button
                        onClick={() => navigate("/orders")}
                        className="px-4 py-3 hover:bg-gray-100 w-full text-left"
                      >
                        Orders
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="px-4 py-3 hover:bg-gray-100 text-red-600 w-full text-left"
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
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              className="flex md:hidden p-2 ml-auto"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-7 h-7 text-white" />
              ) : (
                <Menu className="w-7 h-7 text-white" />
              )}
            </button>
          </div>

          {/* DESKTOP CATEGORY NAV */}
          <div className="hidden md:flex gap-10 py-2 px-2 text-white text-sm font-semibold tracking-wide">

            <button
              onClick={() => navigate("/watches")}
              className="hover:text-[#C8A962] transition"
            >
              Watches
            </button>

            <button
              onClick={() => navigate("/shoes")}
              className="hover:text-[#C8A962] transition"
            >
              Shoes
            </button>

            <button
              onClick={() => navigate("/spectacles")}
              className="hover:text-[#C8A962] transition"
            >
              Spectacles
            </button>
          </div>

        </div>
      </header>

      {/* ------------------------------------- */}
      {/* MOBILE SEARCH BAR */}
      {/* ------------------------------------- */}
      {/* MOBILE SEARCH BAR */}
      <div className="sm:hidden w-full px-4 mt-4 mb-2">
        <div className="relative w-full">
          <input
            id="mobile-search-input"
            type="text"
            placeholder="Search products..."
            onKeyDown={(e) => {
              if (e.key === "Enter")
                navigate(`/search?q=${e.currentTarget.value}`);
            }}
            className="w-full px-4 py-2 pl-11 rounded-full text-black shadow-md focus:outline-none"
          />

          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer"
            onClick={() => {
              const value = (
                document.querySelector(
                  '#mobile-search-input'
                ) as HTMLInputElement
              )?.value;
              navigate(`/search?q=${value}`);
            }}
          />
        </div>
      </div>


      {/* ------------------------------------- */}
      {/* MOBILE MENU */}
      {/* ------------------------------------- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden">

          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full w-72 bg-[#1A3A35] shadow-2xl rounded-r-2xl animate-slideIn">

            <div className="flex justify-between items-center p-5 border-b border-white/10">
              <span className="text-lg font-bold text-white">Menu</span>
              <X
                className="w-7 h-7 text-white"
                onClick={() => setMobileMenuOpen(false)}
              />
            </div>

            <div className="flex flex-col p-5 space-y-6 text-white">

              <button className="flex items-center gap-3 text-lg" onClick={() => { navigate("/"); setMobileMenuOpen(false); }}>
                <Home className="w-6 h-6" /> Home
              </button>

              <button className="flex items-center gap-3 text-lg" onClick={() => { navigate("/watches"); setMobileMenuOpen(false); }}>
                <Grid className="w-6 h-6" /> Watches
              </button>

              <button className="flex items-center gap-3 text-lg" onClick={() => { navigate("/shoes"); setMobileMenuOpen(false); }}>
                <Grid className="w-6 h-6" /> Shoes
              </button>

              <button className="flex items-center gap-3 text-lg" onClick={() => { navigate("/spectacles"); setMobileMenuOpen(false); }}>
                <Grid className="w-6 h-6" /> Spectacles
              </button>

              <button className="flex items-center gap-3 text-lg" onClick={() => { navigate("/contact"); setMobileMenuOpen(false); }}>
                <Mail className="w-6 h-6" /> Contact
              </button>

              {user && (
                <button className="flex items-center gap-3 text-lg" onClick={() => { navigate("/orders"); setMobileMenuOpen(false); }}>
                  <ShoppingCart className="w-6 h-6" /> Orders
                </button>
              )}

              <button className="flex items-center gap-3 text-lg" onClick={() => { navigate("/wishlist"); setMobileMenuOpen(false); }}>
                <Heart className="w-6 h-6" /> Wishlist
              </button>

              <button className="flex items-center gap-3 text-lg" onClick={() => { navigate("/account"); setMobileMenuOpen(false); }}>
                <User className="w-6 h-6" /> Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------- */}
      {/* MOBILE BOTTOM NAV */}
      {/* ------------------------------------- */}
      <nav className="mobile-bottom-nav fixed bottom-0 left-0 w-full bg-[#2D5550] sm:hidden z-[998] border-t border-white/20">
        <div className="flex justify-around py-3">

          <button className="flex flex-col items-center text-white" onClick={() => navigate("/")}>
            <Home className="w-6 h-6" />
            <span className="text-[11px] mt-1">Home</span>
          </button>



          <button className="relative flex flex-col items-center text-white" onClick={() => navigate("/wishlist")}>
            <Heart className="w-6 h-6" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 right-2 bg-[#C8A962] text-[10px] text-white rounded-full px-1.5">
                {wishlistCount}
              </span>
            )}
            <span className="text-[11px] mt-1">Wishlist</span>
          </button>

          <button className="relative flex flex-col items-center text-white" onClick={() => navigate("/cart")}>
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 right-2 bg-[#C8A962] text-[10px] text-white rounded-full px-1.5">
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
