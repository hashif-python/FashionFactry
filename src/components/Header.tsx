import { useState } from 'react';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onNavigate: (page: string) => void;
  cartItemCount: number;
}

export const Header = ({ onNavigate, cartItemCount }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    onNavigate('home');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src="/logo_smooth.png" alt="Fashionfactry" className="h-10 w-auto" />
              <span className="text-xl font-bold text-[#0B1D39]">Fashionfactry</span>
            </button>

            <nav className="hidden md:flex gap-6">
              <button
                onClick={() => onNavigate('home')}
                className="text-gray-700 hover:text-[#C8A962] font-medium transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('watches')}
                className="text-gray-700 hover:text-[#C8A962] font-medium transition-colors"
              >
                Watches
              </button>
              <button
                onClick={() => onNavigate('shoes')}
                className="text-gray-700 hover:text-[#C8A962] font-medium transition-colors"
              >
                Shoes
              </button>
              <button
                onClick={() => onNavigate('spectacles')}
                className="text-gray-700 hover:text-[#C8A962] font-medium transition-colors"
              >
                Spectacles
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
              <Search className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={() => onNavigate('cart')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C8A962] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <User className="w-5 h-5 text-gray-700" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 animate-fade-in">
                    <button
                      onClick={() => {
                        onNavigate('account');
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      My Account
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('orders');
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Orders
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="hidden sm:block px-4 py-2 bg-[#0B1D39] text-white rounded-lg hover:bg-[#C8A962] transition-colors font-medium"
              >
                Login
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-slide-in">
          <nav className="px-4 py-4 space-y-2">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-gray-700 hover:text-[#C8A962]"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('watches');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-gray-700 hover:text-[#C8A962]"
            >
              Watches
            </button>
            <button
              onClick={() => {
                onNavigate('shoes');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-gray-700 hover:text-[#C8A962]"
            >
              Shoes
            </button>
            <button
              onClick={() => {
                onNavigate('spectacles');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-gray-700 hover:text-[#C8A962]"
            >
              Spectacles
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
