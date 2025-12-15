// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import { AuthProvider } from './contexts/AuthContext';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FeatureTicker } from './components/FeatureTicker';

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
import { Address } from './pages/Address';
import { OrderDetail } from './pages/OrderDetail';
import { RequireAuth, RequireAnon } from './routes/guards';
import { WalletPage } from './pages/Wallet';
import { AddMoneyPage } from './pages/AddMoney';
import { WalletTransactionsPage } from './pages/WalletTransactions';
import { Toaster } from 'react-hot-toast';
import { About } from "./pages/About";
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";
import { Contact } from './pages/Contact';
import { Search } from './pages/Search';

// Scroll to top on navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 🔥 GLOBAL TOASTER */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1A3A35',
            color: '#fff',
            borderRadius: '10px',
          },
        }}
      />

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
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* Auth restrictions */}
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

          {/* Only logged-in users */}
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
            path="/orders/:order_id"
            element={
              <RequireAuth>
                <OrderDetail />
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
          <Route
            path="/address"
            element={
              <RequireAuth>
                <Address />
              </RequireAuth>
            }
          />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/wallet/add-money" element={<AddMoneyPage />} />
          <Route path="/wallet/transactions" element={<WalletTransactionsPage />} />

          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/search" element={<Search />} />


          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
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
