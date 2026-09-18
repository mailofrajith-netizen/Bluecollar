import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import RootLayout from './layouts/RootLayout';
import AdminLayout from './layouts/AdminLayout';

// Route guard
import ProtectedRoute from './components/common/ProtectedRoute';

// Customer pages
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import TrackOrderPage from './pages/TrackOrderPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import FranchisePage from './pages/FranchisePage';
import StoresPage from './pages/StoresPage';
import ReturnPolicyPage from './pages/ReturnPolicyPage';

// Admin pages
import NotFoundPage from './pages/NotFoundPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminInvoicesPage from './pages/admin/AdminInvoicesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ----------------------------------------------------------------
            Customer-facing routes wrapped in the root layout
        ---------------------------------------------------------------- */}
        <Route element={<RootLayout />}>
          {/* Public routes */}
          <Route path="/"                  element={<HomePage />} />
          <Route path="/products"          element={<ProductListingPage />} />
          <Route path="/products/:slug"    element={<ProductDetailPage />} />
          <Route path="/track-order"       element={<TrackOrderPage />} />
          <Route path="/about"             element={<AboutPage />} />
          <Route path="/contact"           element={<ContactPage />} />
          <Route path="/login"             element={<LoginPage />} />
          <Route path="/register"          element={<RegisterPage />} />
          <Route path="/verify-email"      element={<VerifyEmailPage />} />
          <Route path="/franchise"         element={<FranchisePage />} />
          <Route path="/stores"            element={<StoresPage />} />
          <Route path="/return-policy"     element={<ReturnPolicyPage />} />

          {/* Cart and checkout are accessible without login (guest checkout supported) */}
          <Route path="/cart"              element={<CartPage />} />
          <Route path="/checkout"          element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />

          {/* Protected customer routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/account"         element={<AccountPage />} />
          </Route>
        </Route>

        {/* ----------------------------------------------------------------
            Admin routes — AdminLayout handles its own auth guard
        ---------------------------------------------------------------- */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products"        element={<AdminProductsPage />} />
          <Route path="orders"          element={<AdminOrdersPage />} />
          <Route path="orders/:id"      element={<AdminOrderDetailPage />} />
          <Route path="users"           element={<AdminUsersPage />} />
          <Route path="invoices"        element={<AdminInvoicesPage />} />
          <Route path="settings"        element={<AdminSettingsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
