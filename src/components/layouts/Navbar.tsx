import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, ChevronDown, LogOut, ClipboardList, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // Thêm state cho Dropdown user

  // 2. Lấy các giá trị từ AuthContext
  const { user, isAuthenticated, logout } = useAuth();

  const categories = [
    { id: 1, name: 'Trà Sữa Nguyên Bản', slug: 'tra-sua-nguyen-ban' },
    { id: 2, name: 'Trà Trái Cây', slug: 'tra-trai-cay' },
    { id: 3, name: 'Đá Xay (Freeze)', slug: 'da-xay' },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-white py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl">GD</div>
          <span className="font-extrabold text-2xl tracking-tight text-gray-900 hidden sm:block">
            Milktea<span className="text-amber-500">.</span>
          </span>
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-gray-700">
          <Link to="/" className="hover:text-amber-500 transition-colors">Trang chủ</Link>
          
          <div className="relative group cursor-pointer" onMouseEnter={() => setIsCategoryOpen(true)} onMouseLeave={() => setIsCategoryOpen(false)}>
            <div className="flex items-center gap-1 hover:text-amber-500 transition-colors">
              Thực đơn <ChevronDown size={16} className={`transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </div>
            <div className={`absolute top-full left-0 w-56 pt-4 transition-all duration-300 ${isCategoryOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
              <div className="bg-white border border-gray-100 shadow-xl rounded-xl py-2 overflow-hidden">
                {categories.map((cat) => (
                  <Link key={cat.id} to={`/category/${cat.slug}`} className="block px-4 py-2 hover:bg-amber-50 hover:text-amber-600 transition-colors">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* ICONS & ACTIONS */}
        <div className="flex items-center gap-5">
          <button className="text-gray-600 hover:text-amber-500 transition-colors hidden sm:block">
            <Search size={22} />
          </button>

          {/* Icon Giỏ hàng */}
          <Link to="/cart" className="relative text-gray-600 hover:text-amber-500 transition-colors">
            <ShoppingBag size={22} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
              3
            </span>
          </Link>

          {/* 3. LOGIC XỬ LÝ TRẠNG THÁI ĐĂNG NHẬP Ở ĐÂY */}
          <div className="hidden md:block">
            {isAuthenticated && user ? (
              // Trạng thái: ĐÃ ĐĂNG NHẬP -> Hiện Tên + Avatar + Dropdown
              <div 
                className="relative group cursor-pointer"
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                  <div className="w-9 h-9 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold">
                    {/* Lấy chữ cái đầu của Tên làm Avatar */}
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-700 hover:text-amber-500 transition-colors">
                    {user.fullName.split(' ').pop()} {/* Lấy tên cuối */}
                  </span>
                  <ChevronDown size={14} className="text-gray-500" />
                </div>

                {/* Dropdown Menu của User */}
                <div className={`absolute top-full right-0 w-48 pt-4 transition-all duration-300 ${isUserMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                  <div className="bg-white border border-gray-100 shadow-xl rounded-xl py-2 overflow-hidden flex flex-col">
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 transition-colors">
                      <Settings size={16} /> Tài khoản
                    </Link>
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 transition-colors">
                      <ClipboardList size={16} /> Đơn hàng
                    </Link>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button 
                      onClick={logout}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600 w-full text-left transition-colors"
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Trạng thái: CHƯA ĐĂNG NHẬP -> Hiện nút Đăng nhập / Đăng ký
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <Link to="/login" className="text-gray-900 font-medium hover:text-amber-500 transition-colors">
                  Đăng nhập
                </Link>
                <Link to="/register" className="bg-gray-900 text-white px-5 py-2 rounded-full hover:bg-amber-500 transition-all font-medium">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-gray-900" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>
    </header>
  );
};