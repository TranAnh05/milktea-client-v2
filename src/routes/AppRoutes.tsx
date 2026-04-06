import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Tạm thời tạo một component Home giả để test
const HomePage = () => <div className="container mx-auto p-8 text-center text-2xl font-bold">Trang chủ Trà Sữa (Đang xây dựng...)</div>;

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Bọc MainLayout ở ngoài. 
        Tất cả các route con ở trong sẽ tự động có Navbar ở trên và Footer ở dưới 
      */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Sau này em sẽ thêm /register, /cart, /category/:slug vào đây */}
      </Route>
    </Routes>
  );
};