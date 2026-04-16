/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/CheckoutPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { orderService, type OrderRequest } from "@/services/orderService";
import {
    voucherService,
    type VoucherResponse,
} from "@/services/voucherService";

type CheckoutFormInputs = {
    customerName: string;
    phone: string;
    address: string;
    note: string;
    paymentMethod: string;
};

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const { cartItems, cartTotal, clearCart } = useCart();

    // --- STATE CHO VOUCHER ---
    const [voucherCodeInput, setVoucherCodeInput] = useState("");
    const [appliedVoucher, setAppliedVoucher] = useState<{
        id: number;
        code: string;
        discountAmount: number;
    } | null>(null);
    const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
    const [voucherError, setVoucherError] = useState<string | null>(null);

    // --- STATE CHO VÍ VOUCHER ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeVouchers, setActiveVouchers] = useState<VoucherResponse[]>([]);
    const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);

    const SHIPPING_FEE = 15000;
    // Tính tổng tiền cuối cùng (Có trừ tiền voucher)
    const finalTotal = Math.max(
        0,
        cartTotal + SHIPPING_FEE - (appliedVoucher?.discountAmount || 0),
    );

    // Khởi tạo React Hook Form
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<CheckoutFormInputs>({
        defaultValues: {
            paymentMethod: "COD", // Mặc định chọn COD
        },
    });

    const selectedPaymentMethod = watch("paymentMethod");

    // Tự động điền thông tin nếu đã Login
    useEffect(() => {
        if (isAuthenticated && user) {
            setValue("customerName", user.fullName || "");
            setValue("phone", user.phone || "");
        }
    }, [isAuthenticated, user, setValue]);

    // Handle giỏ hàng trống
    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 bg-gray-50">
                <div className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <svg
                        className="w-20 h-20 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-700">
                    Giỏ hàng của bạn đang trống
                </h2>
                <p className="text-gray-500">
                    Hãy quay lại thực đơn để chọn món nhé!
                </p>
                <button
                    onClick={() => navigate("/category/all")}
                    className="mt-4 px-8 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all shadow-md hover:shadow-lg"
                >
                    Tiếp tục mua sắm
                </button>
            </div>
        );
    }

    const openVoucherModal = async () => {
        setIsModalOpen(true);
        if (activeVouchers.length === 0) {
            // Tránh gọi API nhiều lần nếu đã có data
            setIsLoadingVouchers(true);
            try {
                const res = await voucherService.getActiveVouchers();
                if (res.data) setActiveVouchers(res.data);
            } catch (error) {
                toast.error("Không thể tải danh sách ưu đãi lúc này.");
            } finally {
                setIsLoadingVouchers(false);
            }
        }
    };

    const handleApplyVoucher = async (codeOverride?: string) => {
        const targetCode =
            codeOverride !== undefined ? codeOverride : voucherCodeInput;
        setVoucherError(null);

        if (!targetCode.trim()) {
            setVoucherError("Vui lòng nhập mã giảm giá.");
            return;
        }

        setIsApplyingVoucher(true);

        try {
            const response = await voucherService.checkVoucher(
                targetCode,
                cartTotal,
            );

            if (response.data) {
                setAppliedVoucher({
                    id: response.data.id,
                    code: response.data.code,
                    discountAmount: response.data.discountAmount,
                });
                setVoucherCodeInput("");
                setVoucherError(null);

                setIsModalOpen(false);
                toast.success(
                    response.data.message || "Áp dụng mã thành công!",
                );
            }
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Mã giảm giá không hợp lệ.";
            setVoucherError(errorMessage);
            // Xóa voucher hiện tại nếu nhập mã sai
            setAppliedVoucher(null);
        } finally {
            setIsApplyingVoucher(false);
        }
    };

    const removeVoucher = () => {
        setAppliedVoucher(null);
        setVoucherError(null);
    };

    // Luồng xử lý Submit
    const onSubmit: SubmitHandler<CheckoutFormInputs> = async (data) => {
        if (voucherCodeInput.trim() !== "" && !appliedVoucher) {
            setVoucherError(
                "Mã giảm giá chưa được áp dụng. Vui lòng ấn 'Áp dụng' hoặc xóa chữ trong ô.",
            );
            return;
        }

        try {
            const requestPayload: OrderRequest = {
                customerName: data.customerName,
                phone: data.phone,
                address: data.address,
                note: data.note,
                paymentMethod: data.paymentMethod,
                voucherId: appliedVoucher ? appliedVoucher.id : null,
                // Ép kiểu chuẩn xác cho khách vãng lai
                guestItems: isAuthenticated
                    ? null
                    : cartItems.map((item) => ({
                          signature: item.signature,
                          productId: item.productId,
                          sizeId: item.sizeId,
                          sugarLevel: item.sugarLevel,
                          iceLevel: item.iceLevel,
                          toppingIds: item.toppings.map((t) => t.id),
                          quantity: item.quantity,
                      })),
            };

            const response = await orderService.placeOrder(requestPayload);

            if (response.data) {
                toast.success("Đặt hàng thành công.");
                clearCart();

                const { orderId , finalTotal, paymentMethod } = response.data

                if(paymentMethod === 'COD') {
                    navigate(`/thank-you?orderId=${orderId}`);
                } else if (paymentMethod === 'BANK_TRANSFER') {
                    // VietQR Tự động: Bay sang trang hiện mã QR, truyền theo số tiền để render
                    navigate(`/payment-qr?orderId=${orderId}&amount=${finalTotal}`);
                } else {
                    toast.error("Phương thức thanh toán chưa được hỗ trợ trên UI")
                }

            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    "Có lỗi xảy ra, vui lòng thử lại sau.",
            );
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
                Thanh toán
            </h1>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10"
            >
                {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG & THANH TOÁN */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Card: Thông tin giao hàng */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                            <svg
                                className="w-6 h-6 mr-2 text-orange-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                            Thông tin nhận hàng
                        </h2>

                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên người nhận"
                                    readOnly={isAuthenticated}
                                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none transition-colors 
                                          ${errors.customerName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-orange-500"} 
                                          ${isAuthenticated ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-gray-50 focus:bg-white focus:ring-2"}`}
                                    {...register("customerName", {
                                        required: "Vui lòng nhập họ tên",
                                    })}
                                />
                                {errors.customerName && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.customerName.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số điện thoại *
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Ví dụ: 0912345678"
                                    readOnly={isAuthenticated}
                                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none transition-colors 
                                              ${errors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-orange-500"} 
                                              ${isAuthenticated ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-gray-50 focus:bg-white focus:ring-2"}`}
                                    {...register("phone", {
                                        required: "Vui lòng nhập số điện thoại",
                                        pattern: {
                                            value: /^(0[3|5|7|8|9])+([0-9]{8})$/,
                                            message:
                                                "Số điện thoại không hợp lệ",
                                        },
                                    })}
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Địa chỉ giao hàng *
                                </label>

                                <input
                                    type="text"
                                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.address ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-orange-500"} focus:outline-none focus:ring-2 transition-colors bg-gray-50 focus:bg-white`}
                                    {...register("address", {
                                        required:
                                            "Vui lòng nhập địa chỉ nhận hàng",
                                    })}
                                />

                                {errors.address && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.address.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ghi chú cho quán (Tùy chọn)
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Ví dụ: Lấy nhiều đá, tới nơi gọi điện..."
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-orange-500 focus:outline-none focus:ring-2 transition-colors bg-gray-50 focus:bg-white resize-none"
                                    {...register("note")}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Card: Phương thức thanh toán */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                            <svg
                                className="w-6 h-6 mr-2 text-orange-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                />
                            </svg>
                            Phương thức thanh toán
                        </h2>

                        <div className="space-y-4">
                            {/* Option 1: COD */}
                            <label
                                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === "COD" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300"}`}
                            >
                                <input
                                    type="radio"
                                    value="COD"
                                    className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                                    {...register("paymentMethod")}
                                />
                                <div className="ml-4 flex-1">
                                    <span className="block font-semibold text-gray-800">
                                        Thanh toán khi nhận hàng (COD)
                                    </span>
                                    <span className="block text-sm text-gray-500">
                                        Kiểm tra hàng trước khi thanh toán
                                    </span>
                                </div>
                                <img
                                    src="/cod-icon.png"
                                    alt="COD"
                                    className="w-10 h-10 object-contain"
                                    onError={(e) =>
                                        (e.currentTarget.style.display = "none")
                                    }
                                />
                            </label>

                            {/* Option 2: VNPAY (Tạm ẩn hoặc Disable nếu chưa làm backend) */}
                            <label
                                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === "BANK_TRANSFER" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300"}`}
                            >
                                <input
                                    type="radio"
                                    value="BANK_TRANSFER"
                                    className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                                    {...register("paymentMethod")}
                                />
                                <div className="ml-4 flex-1">
                                    <span className="block font-semibold text-gray-800">
                                        Chuyển khoản bằng ngân hàng
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (STICKY) */}
                <div className="lg:col-span-5">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-800 mb-5 border-b pb-4">
                            Tóm tắt đơn hàng
                        </h2>

                        {/* List Món ăn */}
                        <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-4 mb-6 custom-scrollbar">
                            {cartItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex gap-4 items-start"
                                >
                                    <img
                                        src={
                                            `/assets/${item.thumbnailUrl}`
                                        }
                                        alt={item.productName}
                                        className="w-16 h-16 object-cover rounded-lg border border-gray-100"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 text-sm">
                                            {item.productName}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Size {item.sizeName} •{" "}
                                            {item.sugarLevel} Đường •{" "}
                                            {item.iceLevel} Đá
                                        </p>
                                        {item.toppings.length > 0 && (
                                            <p className="text-xs text-gray-500">
                                                +{" "}
                                                {item.toppings
                                                    .map((t) => t.name)
                                                    .join(", ")}
                                            </p>
                                        )}
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-sm font-medium text-gray-600">
                                                SL: {item.quantity}
                                            </span>
                                            <span className="font-bold text-orange-600">
                                                {item.totalPrice.toLocaleString(
                                                    "vi-VN",
                                                )}{" "}
                                                đ
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* --- KHU VỰC NHẬP VOUCHER --- */}
                        <div className="border-t border-gray-100 pt-5 mt-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Mã khuyến mãi / Voucher
                            </h3>

                            <button
                                type="button"
                                onClick={openVoucherModal}
                                className="text-sm font-semibold text-orange-500 hover:text-orange-600 flex items-center"
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
                                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                    />
                                </svg>
                                Chọn hoặc Nhập mã
                            </button>

                            {appliedVoucher && (
                                <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg">
                                    <div className="flex items-center">
                                        <svg
                                            className="w-5 h-5 text-green-500 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        <span className="font-semibold text-green-700 uppercase">
                                            {appliedVoucher.code}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeVoucher}
                                        className="text-red-500 text-sm hover:underline font-medium"
                                    >
                                        Xóa bỏ
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Bảng tính tiền */}
                        <div className="border-t border-gray-100 pt-4 space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính ({cartItems.length} món)</span>
                                <span>
                                    {cartTotal.toLocaleString("vi-VN")} đ
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí giao hàng</span>
                                <span>
                                    {SHIPPING_FEE.toLocaleString("vi-VN")} đ
                                </span>
                            </div>
                            {appliedVoucher && (
                                <div className="flex justify-between text-green-600 font-medium bg-green-50 p-2 rounded-lg -mx-2 px-2">
                                    <span>
                                        Mã áp dụng:{" "}
                                        <strong className="uppercase">
                                            {appliedVoucher.code}
                                        </strong>
                                    </span>
                                    <span>
                                        -{" "}
                                        {appliedVoucher.discountAmount.toLocaleString(
                                            "vi-VN",
                                        )}{" "}
                                        đ
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center border-t border-dashed pt-4 mt-2">
                                <span className="text-lg font-bold text-gray-800">
                                    Tổng cộng
                                </span>
                                <span className="text-2xl font-extrabold text-orange-600">
                                    {finalTotal.toLocaleString("vi-VN")} đ
                                </span>
                            </div>
                        </div>

                        {/* Nút Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full mt-6 py-4 rounded-xl text-white font-bold text-lg uppercase tracking-wide transition-all shadow-md 
                                      ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 hover:shadow-lg"}`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Đang xử lý...
                                </span>
                            ) : (
                                "ĐẶT HÀNG NGAY"
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* ================= MODAL VÍ VOUCHER ================= */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                        {/* Header Modal */}
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">
                                Chọn mã khuyến mãi
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Ô nhập tay cho ai thích gõ */}
                        <div className="p-4 border-b flex flex-col gap-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={voucherCodeInput}
                                    onChange={(e) => {
                                        setVoucherCodeInput(e.target.value);
                                        if (voucherError) setVoucherError(null);
                                    }}
                                    placeholder="Nhập mã giảm giá"
                                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-orange-500 uppercase"
                                />
                                <button
                                    type="button"
                                    // XÓA cái setIsModalOpen(false) ở đây đi, chỉ gọi API thôi
                                    onClick={() => handleApplyVoucher()}
                                    disabled={
                                        isApplyingVoucher ||
                                        !voucherCodeInput.trim()
                                    }
                                    className={`px-4 py-2 rounded-lg font-medium text-white ${isApplyingVoucher ? "bg-gray-400" : "bg-gray-800"}`}
                                >
                                    {isApplyingVoucher
                                        ? "Đang xét..."
                                        : "Áp dụng"}
                                </button>
                            </div>
                            {/* BỔ SUNG: Hiện dòng lỗi đỏ ngay trong Modal nếu nhập bậy */}
                            {voucherError && (
                                <p className="text-red-500 text-sm flex items-center mt-1">
                                    <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    {voucherError}
                                </p>
                            )}
                        </div>

                        {/* Danh sách Voucher */}
                        <div className="p-4 overflow-y-auto flex-1 bg-gray-50 space-y-4">
                            {isLoadingVouchers ? (
                                <div className="text-center text-gray-500 py-10">
                                    Đang tải mã giảm giá...
                                </div>
                            ) : activeVouchers.length === 0 ? (
                                <div className="text-center text-gray-500 py-10">
                                    Rất tiếc, hiện chưa có mã giảm giá nào.
                                </div>
                            ) : (
                                activeVouchers.map((v) => {
                                    // Đỉnh cao UX: Check điều kiện ngay tại Frontend
                                    const isEligible =
                                        cartTotal >= (v.minOrderAmount || 0);
                                    const shortfall =
                                        (v.minOrderAmount || 0) - cartTotal;

                                    return (
                                        <div
                                            key={v.id}
                                            className={`flex bg-white rounded-xl border p-3 shadow-sm ${!isEligible ? "opacity-60" : "border-orange-200"}`}
                                        >
                                            {/* Cột Icon */}
                                            <div
                                                className={`w-20 flex flex-col items-center justify-center border-r border-dashed mr-3 pr-3 ${isEligible ? "text-orange-500" : "text-gray-400"}`}
                                            >
                                                <svg
                                                    className="w-8 h-8 mb-1"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                                                    />
                                                </svg>
                                                <span className="text-[10px] font-bold text-center uppercase">
                                                    {v.code}
                                                </span>
                                            </div>

                                            {/* Cột Thông tin */}
                                            <div className="flex-1 flex flex-col justify-center">
                                                <p className="font-bold text-gray-800 text-sm">
                                                    {v.message}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Đơn tối thiểu{" "}
                                                    {v.minOrderAmount?.toLocaleString(
                                                        "vi-VN",
                                                    )}
                                                    đ
                                                </p>

                                                {!isEligible && (
                                                    <p className="text-xs text-red-500 mt-2 font-medium">
                                                        Mua thêm{" "}
                                                        {shortfall.toLocaleString(
                                                            "vi-VN",
                                                        )}
                                                        đ để áp dụng
                                                    </p>
                                                )}
                                            </div>

                                            {/* Nút Chọn */}
                                            <div className="flex items-center ml-2">
                                                <button
                                                    type="button"
                                                    disabled={!isEligible}
                                                    onClick={() => {
                                                        handleApplyVoucher(
                                                            v.code,
                                                        );
                                                    }}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors
                            ${isEligible ? "bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                                                >
                                                    Dùng
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
