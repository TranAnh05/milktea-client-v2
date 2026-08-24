import { Link, useNavigate } from "react-router-dom";
import {
    Trash2,
    Minus,
    Plus,
    ShoppingBag,
    ArrowLeft,
    ArrowRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateQuantity, removeFromCart } from "@/redux/slices/cartSlice";
import { formatCurrency } from "@/utils/formatters";

export const CartPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { cartItems } = useAppSelector((state) => state.cart);

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const handleUpdateQuantity = (signature: string, newQuantity: number) => {
        dispatch(updateQuantity({ signature, newQuantity }));
    };

    const handleRemoveFromCart = (signature: string) => {
        dispatch(removeFromCart(signature));
    };

    // --- TRẠNG THÁI: GIỎ HÀNG TRỐNG ---
    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
                <div className="w-40 h-40 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={80} className="text-amber-300" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                    Giỏ hàng của bạn đang trống
                </h2>
                <p className="text-gray-500 mb-8 text-center max-w-md">
                    Chưa có ly trà sữa nào được chọn. Hãy quay lại thực đơn và
                    chọn cho mình một hương vị yêu thích nhé!
                </p>
                <Link
                    to="/"
                    className="bg-gray-900 text-white px-8 py-3.5 rounded-full font-bold hover:bg-amber-500 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                    Khám phá Thực đơn <ArrowRight size={20} />
                </Link>
            </div>
        );
    }

    // --- TRẠNG THÁI: CÓ HÀNG ---
    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="container mx-auto px-4 md:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Giỏ hàng của bạn
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Bạn đang có {cartCount} sản phẩm trong giỏ
                    </p>
                </div>

                {/* Layout 2 cột: Cột trái (List sp) - Cột phải (Tổng kết) */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
                    <div className="lg:w-2/3 space-y-4">
                        {cartItems.map((item) => (
                            <div
                                key={item.signature}
                                className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-5 transition-all hover:shadow-md"
                            >
                                {/* Hình ảnh */}
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                    <img
                                        src={item.thumbnailUrl}
                                        alt={item.productName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Thông tin chi tiết */}
                                <div className="grow flex flex-col justify-between">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <Link
                                                to={`/product/${item.slug}`}
                                                className="text-lg font-bold text-gray-900 hover:text-amber-600 transition-colors line-clamp-1"
                                            >
                                                {item.productName}
                                            </Link>

                                            {/* Hiển thị cấu hình khách chọn (Cực kỳ quan trọng cho F&B) */}
                                            <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                                                <p>
                                                    <span className="font-medium text-gray-700">
                                                        Size:
                                                    </span>{" "}
                                                    {item.sizeName}
                                                </p>
                                                <p>
                                                    <span className="font-medium text-gray-700">
                                                        Đường/Đá:
                                                    </span>{" "}
                                                    {item.sugarLevel} Đường,{" "}
                                                    {item.iceLevel} Đá
                                                </p>
                                                {item.toppings.length > 0 && (
                                                    <p className="text-amber-600 line-clamp-1">
                                                        +{" "}
                                                        {item.toppings
                                                            .map((t) => t.name)
                                                            .join(", ")}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Nút Xóa (Mobile đẩy xuống dưới, Desktop giữ trên cùng) */}
                                        <button
                                            onClick={() =>
                                                handleRemoveFromCart(item.signature)
                                            }
                                            className="text-gray-400 hover:text-red-500 p-2 -mr-2 -mt-2 transition-colors sm:block hidden"
                                            title="Xóa sản phẩm"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>

                                    {/* Giá và Nút tăng giảm số lượng */}
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                        <div className="text-lg font-extrabold text-amber-600">
                                            {formatCurrency(item.unitPrice)}{" "}
                                            <span className="text-xs text-gray-400 font-normal">
                                                / ly
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {/* Bộ đếm số lượng */}
                                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg h-9">
                                                <button
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item.signature,
                                                            item.quantity - 1,
                                                        )
                                                    }
                                                    disabled={
                                                        item.quantity <= 1
                                                    }
                                                    className="w-9 h-full flex items-center justify-center text-gray-600 hover:text-amber-600 disabled:opacity-30 transition-colors"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <div className="w-8 font-bold text-center text-sm">
                                                    {item.quantity}
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item.signature,
                                                            item.quantity + 1,
                                                        )
                                                    }
                                                    className="w-9 h-full flex items-center justify-center text-gray-600 hover:text-amber-600 transition-colors"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            {/* Nút xóa bản Mobile */}
                                            <button
                                                onClick={() =>
                                                    handleRemoveFromCart(
                                                        item.signature,
                                                    )
                                                }
                                                className="text-gray-400 hover:text-red-500 transition-colors sm:hidden block"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-amber-600 font-medium hover:text-amber-700 transition-colors mt-4"
                        >
                            <ArrowLeft size={18} /> Chọn thêm đồ uống khác
                        </Link>
                    </div>

                    {/* CỘT PHẢI: TỔNG KẾT ĐƠN HÀNG (Sticky) */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                Tổng đơn hàng
                            </h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính ({cartCount} món)</span>
                                    <span className="font-medium text-gray-900">
                                        {formatCurrency(cartTotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Phí giao hàng</span>
                                    <span className="text-sm italic">
                                        Sẽ tính ở bước sau
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Khuyến mãi</span>
                                    <span className="text-sm italic text-amber-600">
                                        Chọn mã ở bước sau
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-8">
                                <div className="flex justify-between items-end">
                                    <span className="text-gray-900 font-bold">
                                        Tổng thanh toán
                                    </span>
                                    <span className="text-2xl font-black text-amber-600">
                                        {formatCurrency(cartTotal)}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 text-right mt-1">
                                    (Đã bao gồm VAT)
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    navigate("/checkout");
                                    window.scrollTo({
                                        top: 0,
                                        behavior: "smooth",
                                    });
                                }}
                                className="w-full bg-gray-900 text-white rounded-xl py-4 font-bold text-lg hover:bg-amber-500 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                Tiến hành Thanh toán <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
