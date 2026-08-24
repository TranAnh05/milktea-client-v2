import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ShoppingBag,
    Menu,
    X,
    ChevronDown,
    LogOut,
    ClipboardList,
    Settings,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/slices/authSlice";

import type { CategoryResponse } from "@/types/category.types";
import { categoryService } from "@/services/categoryService";

export const Header = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const { cartItems } = useAppSelector((state) => state.cart);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); 

    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    
    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getActiveCategories();
                setCategories(response.data);
            } catch (error) {
                console.error("Lỗi khi tải danh mục:", error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        
        // Cleanup on unmount
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMobileMenuOpen]);

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    isScrolled
                        ? "bg-white/80 backdrop-blur-md shadow-sm py-3"
                        : "bg-white py-5"
                }`}
            >
                <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
                    {/* LOGO */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            GD
                        </div>
                        <span className="font-extrabold text-2xl tracking-tight text-gray-900 block">
                            Milktea<span className="text-amber-500">.</span>
                        </span>
                    </Link>

                    {/* DESKTOP MENU */}
                    <nav className="hidden lg:flex items-center gap-8 font-medium text-gray-700">
                        <Link
                            to="/"
                            className="hover:text-amber-500 transition-colors"
                        >
                            Trang chủ
                        </Link>

                        <div
                            className="relative group cursor-pointer"
                            onMouseEnter={() => setIsCategoryOpen(true)}
                            onMouseLeave={() => setIsCategoryOpen(false)}
                        >
                            <div className="flex items-center gap-1 hover:text-amber-500 transition-colors">
                                Thực đơn{" "}
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform ${isCategoryOpen ? "rotate-180" : ""}`}
                                />
                            </div>
                            <div
                                className={`absolute top-full left-0 w-56 pt-4 transition-all duration-300 ${isCategoryOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-2"}`}
                            >
                                <div className="bg-white border border-gray-100 shadow-xl rounded-xl py-2 overflow-hidden">
                                    {categories.length > 0 ? (
                                        categories.map((cat) => (
                                            <Link
                                                key={cat.id}
                                                to={`/category/${cat.slug}`}
                                                className="block px-4 py-2 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                                            >
                                                {cat.name}
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-gray-400 text-sm">
                                            Đang tải...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* ICONS & ACTIONS */}
                    <div className="flex items-center gap-5">
                        {/* Icon Giỏ hàng */}
                        <Link
                            to="/cart"
                            className="relative text-gray-600 hover:text-amber-500 transition-colors"
                        >
                            <ShoppingBag size={22} />
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                                {cartCount}
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
                                            {user.fullName.split(" ").pop()}{" "}
                                            {/* Lấy tên cuối */}
                                        </span>
                                        <ChevronDown
                                            size={14}
                                            className="text-gray-500"
                                        />
                                    </div>

                                    {/* Dropdown Menu của User */}
                                    <div
                                        className={`absolute top-full right-0 w-48 pt-4 transition-all duration-300 ${isUserMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-2"}`}
                                    >
                                        <div className="bg-white border border-gray-100 shadow-xl rounded-xl py-2 overflow-hidden flex flex-col">
                                            <Link
                                                to="/profile"
                                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 transition-colors"
                                            >
                                                <Settings size={16} /> Tài khoản
                                            </Link>
                                            <Link
                                                to="/account/orders"
                                                onClick={() =>
                                                    window.scrollTo({
                                                        top: 0,
                                                        behavior: "smooth",
                                                    })
                                                }
                                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 transition-colors"
                                            >
                                                <ClipboardList size={16} /> Đơn hàng
                                            </Link>
                                            <div className="h-px bg-gray-100 my-1"></div>
                                            <button
                                                onClick={handleLogout}
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
                                    <Link
                                        to="/login"
                                        className="text-gray-900 font-medium hover:text-amber-500 transition-colors"
                                    >
                                        Đăng nhập
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-gray-900 text-white px-5 py-2 rounded-full hover:bg-amber-500 transition-all font-medium"
                                    >
                                        Đăng ký
                                    </Link>
                                    <Link
                                        to="/track-order"
                                        className="flex items-center text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
                                    >
                                        <svg
                                            className="w-5 h-5 mr-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                            />
                                        </svg>
                                        Tra cứu đơn
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden text-gray-900 cursor-pointer"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <X size={26} />
                            ) : (
                                <Menu size={26} />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Drawer Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-9998 md:hidden backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Drawer */}
            <div
                className={`fixed top-0 right-0 bottom-0 w-72 bg-white z-9999 md:hidden shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
                    isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <Link
                        to="/"
                        className="flex items-center gap-1.5"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-base">
                            GD
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-gray-900">
                            Milktea<span className="text-amber-500">.</span>
                        </span>
                    </Link>
                    <button
                        className="text-gray-500 hover:text-gray-900 p-1 cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Navigation Links */}
                    <div className="flex flex-col gap-3.5">
                        <Link
                            to="/"
                            className="text-sm font-semibold text-gray-800 hover:text-amber-500 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Trang chủ
                        </Link>

                        {/* Expandable Menu (Categories) */}
                        <div>
                            <button
                                onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}
                                className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 hover:text-amber-500 transition-colors cursor-pointer"
                            >
                                <span>Thực đơn</span>
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform duration-200 ${isMobileCategoryOpen ? "rotate-180" : ""}`}
                                />
                            </button>
                            
                            <div
                                className={`mt-1.5 pl-3 border-l-2 border-amber-100 flex flex-col gap-1.5 transition-all duration-300 overflow-hidden ${
                                    isMobileCategoryOpen ? "max-h-96 opacity-100 py-1" : "max-h-0 opacity-0"
                                }`}
                            >
                                {categories.length > 0 ? (
                                    categories.map((cat) => (
                                        <Link
                                            key={cat.id}
                                            to={`/category/${cat.slug}`}
                                            className="text-xs text-gray-600 hover:text-amber-500 py-1 transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {cat.name}
                                        </Link>
                                    ))
                                ) : (
                                    <span className="text-gray-400 text-xs">Đang tải...</span>
                                )}
                            </div>
                        </div>

                        <Link
                            to="/track-order"
                            className="text-sm font-semibold text-gray-800 hover:text-amber-500 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Tra cứu đơn hàng
                        </Link>
                    </div>

                    <div className="border-t border-gray-100"></div>

                    {/* User Actions */}
                    <div className="flex flex-col gap-3.5">
                        {isAuthenticated && user ? (
                            <>
                                <div className="flex items-center gap-2.5 py-1">
                                    <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-sm">
                                        {user.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-sm text-gray-800 leading-tight truncate">
                                            {user.fullName}
                                        </p>
                                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">{user.email}</p>
                                    </div>
                                </div>

                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2.5 text-xs text-gray-700 hover:text-amber-500 py-1 font-medium transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Settings size={15} /> Tài khoản của tôi
                                </Link>

                                <Link
                                    to="/account/orders"
                                    className="flex items-center gap-2.5 text-xs text-gray-700 hover:text-amber-500 py-1 font-medium transition-colors"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                >
                                    <ClipboardList size={15} /> Đơn hàng đã mua
                                </Link>

                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="flex items-center gap-2.5 text-xs text-red-600 hover:text-red-700 py-1.5 font-medium transition-colors w-full text-left cursor-pointer"
                                >
                                    <LogOut size={15} /> Đăng xuất
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-2 pt-1">
                                <Link
                                    to="/login"
                                    className="flex items-center justify-center border border-gray-300 text-gray-700 font-semibold py-1.5 text-xs rounded-full hover:bg-gray-50 transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex items-center justify-center bg-gray-900 text-white font-semibold py-1.5 text-xs rounded-full hover:bg-amber-500 transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
