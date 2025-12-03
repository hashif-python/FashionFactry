import { useEffect, useState, useRef } from "react";
import { ShoppingCart, User, Search, Menu, X, Heart } from "lucide-react";
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

  /* ─── Scroll background ─────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ─── Click outside to close menu ───────────── */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const headerBg = scrolled || mobileMenuOpen ? "bg-[#2D5550] shadow-md" : "bg-transparent";

  const handleSignOut = async () => {
    await logout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const IconWithLabel = ({
    title,
    onClick,
    children,
    hideOnMobile = false,
  }: {
    title: string;
    onClick?: () => void;
    children: React.ReactNode;
    hideOnMobile?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center justify-center 
                  rounded-xl transition group
                  ${hideOnMobile ? "hidden sm:flex" : "flex"}
                  w-10 h-10 sm:w-11 sm:h-11`}
    >
      {children}
      <span
        className="pointer-events-none absolute -bottom-5 left-1/2 
                   -translate-x-1/2 text-[10px] sm:text-[11px]
                   text-white/90 opacity-0 group-hover:opacity-100 
                   transition-opacity whitespace-nowrap"
      >
        {title}
      </span>
    </button>
  );

  return (
    <>
      <header className={`sticky top-0 z-[999] ${headerBg} transition duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* Brand */}
            <div className="flex items-center gap-3 sm:gap-8">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-3 hover:opacity-80 transition"
              >
                <img src="/logo_smooth_128.png" className="h-10 w-auto sm:h-12" />
                <span className="text-xl sm:text-2xl font-bold text-[#C8A962]">
                  FashionFactry
                </span>
              </button>

              {/* Nav */}
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
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Search */}
              <IconWithLabel title="Search" hideOnMobile>
                <Search className="w-5 h-5 text-white cursor-pointer" />
              </IconWithLabel>

              {/* Wishlist */}
              <IconWithLabel title="Wishlist" onClick={() => navigate("/wishlist")}>
                <div className="relative">
                  <Heart className="w-5 h-5 text-white" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#C8A962] text-white 
                                    text-[10px] rounded-full px-1.5 py-0.5">
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
                    <span className="absolute -top-1 -right-1 bg-[#C8A962] 
                                    text-white text-[10px] rounded-full px-1.5 py-0.5">
                      {cartCount}
                    </span>
                  )}
                </div>
              </IconWithLabel>

              {/* User */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <IconWithLabel title="Account">
                    <User
                      className="w-6 h-6 text-white cursor-pointer"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                    />
                  </IconWithLabel>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-xl bg-white shadow-2xl 
                                    border border-gray-200 overflow-hidden z-[1000]">
                      <button
                        onClick={() => {
                          navigate("/account");
                          setUserMenuOpen(false);
                        }}
                        className="px-4 py-3 hover:bg-gray-100 w-full text-left"
                      >
                        My Account
                      </button>

                      <button
                        onClick={() => {
                          navigate("/orders");
                          setUserMenuOpen(false);
                        }}
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

              {/* Mobile menu */}
              <button
                className="flex sm:hidden p-2"
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1A3A35] fixed top-20 left-0 w-full z-[999] p-4">
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
          <button className="block text-white py-3 text-lg" onClick={() => navigate("/wishlist")}>
            Wishlist
          </button>
        </div>
      )}
    </>
  );
};
