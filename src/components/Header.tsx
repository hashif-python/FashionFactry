import { useEffect, useState } from 'react';
import { ShoppingCart, User, Search, Menu, X, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onNavigate: (page: string) => void;
  cartItemCount: number;
  wishlistCount: number;
}

export const Header = ({ onNavigate, cartItemCount, wishlistCount }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Turn background green on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    onNavigate('home');
  };

  // Reusable icon button for perfect alignment
  const IconBtn = ({
    title,
    children,
    onClick,
    className = '',
  }: {
    title: string;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <button
      onClick={onClick}
      title={title}
      className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl hover:bg-[#2D5550]/60 transition-colors group ${className}`}
    >
      {children}
      <span className="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-white/90 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {title}
      </span>
    </button>
  );

  // Apply green background when scrolled or when mobile menu is open
  const headerBgClasses = (scrolled || mobileMenuOpen)
    ? 'bg-[#2D5550] shadow-md'
    : 'bg-transparent';

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-300 ${headerBgClasses}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand + Nav */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img src="/logo_smooth_128.png" alt="FashionFactry" className="h-12 w-auto" />
              <span className="text-2xl font-bold text-[#C8A962] tracking-wide brand-font">
                FashionFactry
              </span>
            </button>

            <nav className="hidden md:flex gap-8">
              <button
                onClick={() => onNavigate('home')}
                className="text-white/90 hover:text-[#C8A962] font-medium transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('watches')}
                className="text-white/90 hover:text-[#C8A962] font-medium transition-colors"
              >
                Watches
              </button>
              <button
                onClick={() => onNavigate('shoes')}
                className="text-white/90 hover:text-[#C8A962] font-medium transition-colors"
              >
                Shoes
              </button>
              <button
                onClick={() => onNavigate('spectacles')}
                className="text-white/90 hover:text-[#C8A962] font-medium transition-colors"
              >
                Spectacles
              </button>
            </nav>
          </div>

          {/* Actions (aligned icons) */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden sm:block">
              <IconBtn title="Search products">
                <Search className="w-5 h-5 text-white/90" />
              </IconBtn>
            </div>

            {/* Wishlist */}
            <div className="hidden sm:block">
              <IconBtn title="Wishlist" onClick={() => onNavigate('wishlist')}>
                <Heart className="w-5 h-5 text-white/90" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C8A962] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </IconBtn>
            </div>

            {/* Cart */}
            <IconBtn title="Cart" onClick={() => onNavigate('cart')}>
              <ShoppingCart className="w-5 h-5 text-white/90" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C8A962] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </IconBtn>

            {/* Login / Account */}
            {user ? (
              <div className="relative">
                <IconBtn title="Account" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <User className="w-5 h-5 text-white/90" />
                </IconBtn>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 animate-fade-in border border-[#3D6B64]">
                    <button
                      onClick={() => {
                        onNavigate('account');
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-[#F5F3ED] text-[#2C2C2C]"
                    >
                      My Account
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('orders');
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-[#F5F3ED] text-[#2C2C2C]"
                    >
                      Orders
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 hover:bg-[#F5F3ED] text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <IconBtn title="Login" onClick={() => onNavigate('login')} className="hidden sm:inline-flex">
                <User className="w-5 h-5 text-white/90" />
              </IconBtn>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-white/90" />
              ) : (
                <Menu className="w-6 h-6 text-white/90" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (keeps header green when open) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1A3A35] border-t border-[#2D5550] animate-slide-in">
          <nav className="px-4 py-4 space-y-2">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-white/90 hover:text-[#C8A962] font-medium"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('watches');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-white/90 hover:text-[#C8A962] font-medium"
            >
              Watches
            </button>
            <button
              onClick={() => {
                onNavigate('shoes');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-white/90 hover:text-[#C8A962] font-medium"
            >
              Shoes
            </button>
            <button
              onClick={() => {
                onNavigate('spectacles');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-white/90 hover:text-[#C8A962] font-medium"
            >
              Spectacles
            </button>
            <button
              onClick={() => {
                onNavigate('wishlist');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-white/90 hover:text-[#C8A962] font-medium sm:hidden"
            >
              Wishlist
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
