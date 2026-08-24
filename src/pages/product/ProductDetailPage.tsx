/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Star,
    Minus,
    Plus,
    ShoppingCart,
    Loader2,
} from "lucide-react";
import { productService } from "@/services/productService";
import type {
    ProductDetailResponse,
    SizeDto,
    ToppingDto,
} from "@/types/product.types";
import { formatCurrency } from "@/utils/formatters";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import Breadcrumb from '@/components/common/Breadcrumb';

const SUGAR_LEVELS = ["100%", "70%", "50%", "30%", "0%"];
const ICE_LEVELS = ["100%", "70%", "50%", "0% (Nóng)"];

export const ProductDetailPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    // --- 1. STATES ---
    const [product, setProduct] = useState<ProductDetailResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Form States (Cấu hình giỏ hàng)
    const [selectedSize, setSelectedSize] = useState<SizeDto | null>(null);
    const [selectedSugar, setSelectedSugar] = useState<string>("100%");
    const [selectedIce, setSelectedIce] = useState<string>("100%");
    const [selectedToppings, setSelectedToppings] = useState<ToppingDto[]>([]);
    const [quantity, setQuantity] = useState<number>(1);

    // --- 2. FETCH DATA ---
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                if (!slug) return;
                setIsLoading(true);
                const response = await productService.getProductDetail(slug);
                const data = response.data;
                setProduct(data);

                // Auto-select size đầu tiên nếu có
                if (data.sizes && data.sizes.length > 0) {
                    setSelectedSize(data.sizes[0]);
                }
            } catch (error) {
                toast.error("Không tìm thấy sản phẩm này!");
                navigate("/"); // Lỗi thì đá về trang chủ
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [slug, navigate]);

    // --- 3. LOGIC TÍNH GIÁ TIỀN (Derived State) ---
    const totalPrice = useMemo(() => {
        if (!product || !selectedSize) return 0;

        // Giá cơ sở (đã tính KM) + Phụ thu Size
        let total = product.promotionalPrice + selectedSize.priceSurcharge;

        // Cộng thêm tiền Topping
        selectedToppings.forEach((topping) => {
            total += topping.price;
        });

        // Nhân với số lượng
        return total * quantity;
    }, [product, selectedSize, selectedToppings, quantity]);

    // --- 4. HANDLERS ---
    const handleToppingToggle = (topping: ToppingDto) => {
        setSelectedToppings((prev) => {
            const isExist = prev.find((t) => t.id === topping.id);
            if (isExist) {
                return prev.filter((t) => t.id !== topping.id); // Bỏ chọn
            } else {
                return [...prev, topping]; // Chọn thêm
            }
        });
    };

    const handleAddToCart = () => {
        if (!product || !selectedSize) return toast.error("Vui lòng chọn Size!");

        // 1. Tạo MÃ CHỮ KÝ (Signature) độc nhất cho ly nước này
        // Cấu trúc: ID_SảnPhẩm-ID_Size-Đường-Đá-ID_Topping1_ID_Topping2...
        const toppingIds = selectedToppings
            .map((t) => t.id)
            .sort()
            .join("_");
        const signature = `${product.id}-${selectedSize.id}-${selectedSugar}-${selectedIce}-${toppingIds}`;

        // 2. Tính giá của đúng 1 ly (UnitPrice)
        const unitPrice = product.promotionalPrice + selectedSize.priceSurcharge + selectedToppings.reduce((sum, t) => sum + t.price, 0);

        // 3. Chuẩn bị Payload
        const cartItem = {
            signature: signature,
            productId: product.id,
            productName: product.name,
            thumbnailUrl: product.thumbnailUrl,
            sizeId: selectedSize.id,
            sizeName: selectedSize.name,
            sugarLevel: selectedSugar,
            iceLevel: selectedIce,
            toppings: selectedToppings,
            unitPrice: unitPrice,
            quantity: quantity,
            totalPrice: unitPrice * quantity,
        };

        // 4. Bắn vào Context!
        addToCart(cartItem as any); // Type any vì CartItem chưa được định nghĩa rõ ràng
        toast.success("Đã thêm vào giỏ hàng!");
    };

    // --- 5. RENDER UI ---
    if (isLoading)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-amber-500" size={40} />
            </div>
        );
    if (!product) return null;

    const breadcrumbItems = [
        { label: "Trang chủ", link: "/" },
        { label: "Thực đơn", link: "/category/all" },
        { label: product.categoryName, link: `/category/${product.categorySlug}` },
        { label: product.name },
    ];

    return (
            <div className="container mx-auto px-4 md:px-8">
                {/* --- BREADCRUMBS  --- */}
                <Breadcrumb items={breadcrumbItems} />

                <div className="bg-white rounded-3xl shadow-sm p-6 md:p-10 flex flex-col lg:flex-row gap-10">
                    {/* CỘT TRÁI: HÌNH ẢNH (Sticky) */}
                    <div className="lg:w-5/12">
                        <div className="sticky top-28 bg-gray-100 rounded-2xl overflow-hidden aspect-4/5 flex items-center justify-center">
                            <img
                                src={product.thumbnailUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                            {product.discountPercent > 0 && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white font-bold px-3 py-1 rounded-full shadow-lg">
                                    -{product.discountPercent}%
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CỘT PHẢI: CHI TIẾT & FORM */}
                    <div className="lg:w-7/12 flex flex-col">
                        {/* Header */}
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                            {product.name}
                        </h1>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center text-amber-500 font-bold">
                                <Star
                                    size={18}
                                    fill="currentColor"
                                    className="mr-1"
                                />{" "}
                                {product.averageRating}
                            </div>
                        </div>

                        <div className="flex items-end gap-3 mb-6">
                            <span className="text-4xl font-black text-amber-600">
                                {formatCurrency(product.promotionalPrice)}
                            </span>
                            {product.discountPercent > 0 && (
                                <span className="text-xl text-gray-400 line-through mb-1">
                                    {formatCurrency(product.originalPrice)}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            {product.description}
                        </p>

                        {/* Khung chia cắt */}
                        <div className="h-px bg-gray-200 mb-8"></div>

                        {/* --- FORM CẤU HÌNH --- */}
                        <div className="space-y-8 grow">
                            {/* 1. Chọn Size */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">
                                    1. Chọn Kích cỡ{" "}
                                    <span className="text-red-500">*</span>
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size.id}
                                            onClick={() =>
                                                setSelectedSize(size)
                                            }
                                            className={`border-2 py-3 px-4 rounded-xl text-left transition-all ${
                                                selectedSize?.id === size.id
                                                    ? "border-amber-500 bg-amber-50 text-amber-700 font-bold"
                                                    : "border-gray-200 text-gray-700 hover:border-amber-200"
                                            }`}
                                        >
                                            <div className="block">
                                                {size.name}
                                            </div>
                                            <div className="text-xs mt-1 opacity-70">
                                                {size.priceSurcharge > 0
                                                    ? `+ ${formatCurrency(size.priceSurcharge)}`
                                                    : "Miễn phí"}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 2. Chọn Đường & Đá */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                                        2. Lượng Đường
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {SUGAR_LEVELS.map((level) => (
                                            <button
                                                key={level}
                                                onClick={() =>
                                                    setSelectedSugar(level)
                                                }
                                                className={`border px-3 py-1.5 rounded-lg text-sm transition-all ${selectedSugar === level ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-700 hover:border-gray-500"}`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                                        3. Lượng Đá
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {ICE_LEVELS.map((level) => (
                                            <button
                                                key={level}
                                                onClick={() =>
                                                    setSelectedIce(level)
                                                }
                                                className={`border px-3 py-1.5 rounded-lg text-sm transition-all ${selectedIce === level ? "bg-cyan-600 text-white border-cyan-600" : "border-gray-300 text-gray-700 hover:border-cyan-500"}`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 3. Chọn Topping */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">
                                    4. Thêm Topping (Tùy chọn)
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {product.toppings.map((topping) => {
                                        const isSelected =
                                            selectedToppings.some(
                                                (t) => t.id === topping.id,
                                            );
                                        return (
                                            <label
                                                key={topping.id}
                                                className={`flex items-center justify-between p-3 border-2 rounded-xl cursor-pointer transition-all ${isSelected ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:bg-gray-50"}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() =>
                                                            handleToppingToggle(
                                                                topping,
                                                            )
                                                        }
                                                        className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                                    />
                                                    <span
                                                        className={
                                                            isSelected
                                                                ? "font-bold text-amber-800"
                                                                : "text-gray-700"
                                                        }
                                                    >
                                                        {topping.name}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-medium text-gray-500">
                                                    +
                                                    {formatCurrency(
                                                        topping.price,
                                                    )}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* --- ACTION FOOTER (Sticky Mobile) --- */}
                        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center gap-4 sticky bottom-0 bg-white pb-4">
                            {/* Box Chọn số lượng */}
                            <div className="flex items-center border-2 border-gray-200 rounded-2xl h-14 w-full sm:w-auto">
                                <button
                                    onClick={() =>
                                        setQuantity((q) => Math.max(1, q - 1))
                                    }
                                    className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-amber-500"
                                >
                                    <Minus size={20} />
                                </button>
                                <div className="w-12 font-bold text-center text-lg">
                                    {quantity}
                                </div>
                                <button
                                    onClick={() => setQuantity((q) => q + 1)}
                                    className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-amber-500"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            {/* Nút Thêm vào giỏ */}
                            <button
                                onClick={handleAddToCart}
                                className="grow w-full h-14 bg-amber-500 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all active:scale-95"
                            >
                                <ShoppingCart size={22} />
                                Thêm vào giỏ • {formatCurrency(totalPrice)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
    );
};
