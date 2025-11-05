import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { Home } from './pages/Home';
import { Watches } from './pages/Watches';
import { Shoes } from './pages/Shoes';
import { Spectacles } from './pages/Spectacles';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { Account } from './pages/Account';
import { Orders } from './pages/Orders';

type Page =
  | 'home'
  | 'watches'
  | 'shoes'
  | 'spectacles'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'account'
  | 'orders';

interface Toast {
  message: string;
  type: 'success' | 'error';
}

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [cartItemCount, setCartItemCount] = useState(0);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (user) {
      fetchCartCount();
    } else {
      setCartItemCount(0);
    }
  }, [user]);

  const fetchCartCount = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('user_id', user.id);

    if (!error && data) {
      const total = data.reduce((sum, item) => sum + item.quantity, 0);
      setCartItemCount(total);
    }
  };

  const handleNavigate = (page: Page, productId?: string) => {
    setCurrentPage(page);
    if (productId) {
      setSelectedProductId(productId);
    }
    window.scrollTo(0, 0);
  };

  const handleAddToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      showToast('Please login to add items to cart', 'error');
      handleNavigate('login');
      return;
    }

    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (existingItem) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);

      if (!error) {
        showToast('Cart updated successfully', 'success');
        fetchCartCount();
      }
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity,
        });

      if (!error) {
        showToast('Added to cart successfully', 'success');
        fetchCartCount();
      } else {
        showToast('Failed to add to cart', 'error');
      }
    }
  };

  const handleLoginSuccess = () => {
    showToast('Logged in successfully', 'success');
    handleNavigate('home');
  };

  const handleSignupSuccess = () => {
    showToast('Account created successfully', 'success');
    handleNavigate('home');
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'watches':
        return <Watches onNavigate={handleNavigate} onAddToCart={handleAddToCart} />;
      case 'shoes':
        return <Shoes onNavigate={handleNavigate} onAddToCart={handleAddToCart} />;
      case 'spectacles':
        return <Spectacles onNavigate={handleNavigate} onAddToCart={handleAddToCart} />;
      case 'product':
        return (
          <ProductDetail
            productId={selectedProductId}
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
          />
        );
      case 'cart':
        return <Cart onNavigate={handleNavigate} />;
      case 'checkout':
        return <Checkout onNavigate={handleNavigate} />;
      case 'login':
        return <Login onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
      case 'signup':
        return <Signup onNavigate={handleNavigate} onSignupSuccess={handleSignupSuccess} />;
      case 'forgot-password':
        return <ForgotPassword onNavigate={handleNavigate} />;
      case 'account':
        return <Account onNavigate={handleNavigate} />;
      case 'orders':
        return <Orders onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigate={handleNavigate} cartItemCount={cartItemCount} />
      <main className="flex-1">{renderPage()}</main>
      <Footer onNavigate={handleNavigate} />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
