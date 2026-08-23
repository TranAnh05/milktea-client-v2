import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { HomePage } from '@/pages/home/HomePage';
import { ProductDetailPage } from '@/pages/product/ProductDetailPage';
import { CartPage } from '@/pages/cart/CartPage';
import CheckoutPage from '@/pages/checkout/CheckoutPage';
import ThankYouPage from '@/pages/checkout/ThankYouPage';
import { ProtectedRoute } from './ProtectedRoute';
import OrderHistoryPage from '@/pages/order/OrderHistoryPage';
import OrderDetailPage from '@/pages/order/OrderDetailPage';
import TrackOrderPage from '@/pages/order/TrackOrderPage';
import CategoryProductsPage from '@/pages/product/CategoryProductsPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { PaymentQRPage } from '@/pages/checkout/PaymentQRPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path='/checkout' element={<CheckoutPage />}/>
        <Route path='/thank-you' element={<ThankYouPage />} />
        <Route path="/payment-qr" element={<PaymentQRPage />} />
        <Route path='/track-order' element={<TrackOrderPage />}/>
        <Route path="/category/:slug" element={<CategoryProductsPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* PRIVATE ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account/orders" element={<OrderHistoryPage />} />
          
          <Route path="/account/orders/:orderId" element={<OrderDetailPage />} />
          
        </Route>
      </Route>
    </Routes>
  );
};