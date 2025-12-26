import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./contexts/AuthContext";
import { ApiLoaderProvider } from "./contexts/ApiLoaderContext";
import { useApiLoader } from "./contexts/ApiLoaderContext";

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { FeatureTicker } from "./components/FeatureTicker";

import { Home } from "./pages/Home";
import { Watches } from "./pages/Watches";
import { Shoes } from "./pages/Shoes";
import { Spectacles } from "./pages/Spectacles";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Account } from "./pages/Account";
import { Orders } from "./pages/Orders";
import { Wishlist } from "./pages/Wishlist";
import { VerifyOtp } from "./pages/VerifyOtp";
import { Address } from "./pages/Address";
import { OrderDetail } from "./pages/OrderDetail";
import { WalletPage } from "./pages/Wallet";
import { AddMoneyPage } from "./pages/AddMoney";
import { WalletTransactionsPage } from "./pages/WalletTransactions";
import { About } from "./pages/About";
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";
import { Contact } from "./pages/Contact";
import { Search } from "./pages/Search";
import { BuyNowCheckout } from "./pages/BuyNowCheckout";

import { RequireAuth, RequireAnon } from "./routes/guards";

// --------------------------------------
// Scroll to top on route change
// --------------------------------------
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// --------------------------------------
// 🔥 GLOBAL API LOADER
// --------------------------------------
function GlobalLoader() {
  const { loading } = useApiLoader();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="h-14 w-14 border-4 border-white/20 border-t-[#C8A962] rounded-full animate-spin" />
    </div>
  );
}

// --------------------------------------
// App Layout + Routes
// --------------------------------------
function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 🔥 Global Toast */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1A3A35",
            color: "#fff",
            borderRadius: "10px",
          },
        }}
      />

      {/* 🔥 Global Loader */}
      <GlobalLoader />

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
          <Route path="/search" element={<Search />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth */}
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
          <Route path="/reset-password" element={<ResetPassword />} />


          {/* Protected */}
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
          <Route
            path="/wallet"
            element={
              <RequireAuth>
                <WalletPage />
              </RequireAuth>
            }
          />
          <Route
            path="/wallet/add-money"
            element={
              <RequireAuth>
                <AddMoneyPage />
              </RequireAuth>
            }
          />
          <Route
            path="/wallet/transactions"
            element={
              <RequireAuth>
                <WalletTransactionsPage />
              </RequireAuth>
            }
          />

          <Route
            path="/checkout/buy-now"
            element={
              <RequireAuth>
                <BuyNowCheckout />
              </RequireAuth>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

// --------------------------------------
// Root App
// --------------------------------------
export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ApiLoaderProvider>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AppShell />
          </BrowserRouter>
        </AuthProvider>
      </ApiLoaderProvider>
    </GoogleOAuthProvider>
  );
}
