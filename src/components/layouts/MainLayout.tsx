import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Thêm pt-24 để bù khoảng trống do Navbar là position fixed */}
      <main className="flex-grow pt-24 pb-10">
        <Outlet /> {/* Nơi các trang (Home, Cart...) sẽ hiển thị */}
      </main>
      
      <Footer />
    </div>
  );
};