import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { HomePage } from '@/pages/home/HomePage';
import { ProductDetailPage } from '@/pages/product/ProductDetailPage';
import { CartPage } from '@/pages/cart/CartPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Bọc MainLayout ở ngoài. 
        Tất cả các route con ở trong sẽ tự động có Navbar ở trên và Footer ở dưới 
      */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>
    </Routes>
  );
};