// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { AuthProvider } from './contexts/AuthContext';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FeatureTicker } from './components/FeatureTicker';
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
import { Wishlist } from './pages/Wishlist';
import { VerifyOtp } from './pages/VerifyOtp';

import { RequireAuth, RequireAnon } from './routes/guards'; // <-- include both

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

function AppShell() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <FeatureTicker />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/watches" element={<Watches />} />
          <Route path="/shoes" element={<Shoes />} />
          <Route path="/spectacles" element={<Spectacles />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          {/* Cart/Checkout (you can guard checkout if needed) */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* Anon-only */}
          <Route
            path="/login"
            element={
              <RequireAnon>
                <Login />
              </RequireAnon>
            }
          />
          <Route
            path="/signup"
            element={
              <RequireAnon>
                <Signup />
              </RequireAnon>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <RequireAnon>
                <VerifyOtp />
              </RequireAnon>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Auth-only */}
          <Route
            path="/account"
            element={
              <RequireAuth>
                <Account />
              </RequireAuth>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireAuth>
                <Orders />
              </RequireAuth>
            }
          />
          <Route
            path="/wishlist"
            element={
              <RequireAuth>
                <Wishlist />
              </RequireAuth>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
