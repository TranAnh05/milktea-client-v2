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

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Bọc MainLayout ở ngoài. 
        Tất cả các route con ở trong sẽ tự động có Navbar ở trên và Footer ở dưới 
      */}
      <Route element={<MainLayout />}>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path='/checkout' element={<CheckoutPage />}/>
        <Route path='/thank-you' element={<ThankYouPage />} />
        <Route path='/track-order' element={<TrackOrderPage />}/>
        <Route path="/category/:slug" element={<CategoryProductsPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* PRIVATE ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account/orders" element={<OrderHistoryPage />} />
          
          {/* Chuẩn bị sẵn chỗ cho trang Chi tiết đơn hàng (Sẽ làm tiếp theo) */}
          <Route path="/account/orders/:orderId" element={<OrderDetailPage />} />
          
          {/* Sau này em có thể thêm các trang cá nhân khác ở đây */}
          {/* <Route path="/account/profile" element={<ProfilePage />} /> */}
        </Route>
      </Route>
    </Routes>
  );
};