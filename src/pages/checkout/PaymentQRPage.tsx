import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Copy, CheckCircle2, AlertCircle, ChevronLeft, Loader2, XCircle, Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import toast from 'react-hot-toast';
import { orderService } from '@/services/orderService';

const BANK_CONFIG = {
    BANK_ID: "MB", 
    ACCOUNT_NO: "0355920672", 
    ACCOUNT_NAME: "NGUYEN THI BICH HANG" 
};

export const PaymentQRPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Lấy thông tin từ URL
    const orderId = searchParams.get('orderId');
    const amountStr = searchParams.get('amount');
    const amount = amountStr ? parseInt(amountStr) : 0;

    const [copiedField, setCopiedField] = useState<string | null>(null);

    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 phút = 900 giây
    const [isTimeout, setIsTimeout] = useState(false);

    // Sinh nội dung chuyển khoản bắt buộc: "TS ORD-xxxx" (TS = Trà Sữa)
    const transferContent = `TS ${orderId}`;

    const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.BANK_ID}-${BANK_CONFIG.ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${transferContent}&accountName=${BANK_CONFIG.ACCOUNT_NAME}`;

    useEffect(() => {
        if (!orderId || !amount) {
            toast.error("Thông tin thanh toán không hợp lệ!");
            navigate('/');
        }
    }, [orderId, amount, navigate]);

    // CẢNH BÁO KHI F5 HOẶC ĐÓNG TAB
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!isTimeout) {
                e.preventDefault();
                e.returnValue = ''; // Hiển thị cảnh báo mặc định của trình duyệt
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isTimeout]);

    // CHẶN NÚT BACK CỦA TRÌNH DUYỆT (Bắt buộc với React SPA)
    useEffect(() => {
        // Nếu đã hết giờ thì không cần chặn nữa, cho khách back thoải mái
        if (isTimeout) return;

        // Bước 1: "Đánh lừa" trình duyệt bằng cách nhét chính cái link hiện tại vào lịch sử thêm 1 lần nữa.
        // Việc này tạo ra một bước đệm, khiến khách bấm Back 1 lần thì vẫn ở nguyên trang này.
        window.history.pushState(null, '', window.location.href);

        // Bước 2: Lắng nghe sự kiện khách bấm nút Back
        const handlePopState = () => {
            const confirmLeave = window.confirm(
                "Đơn hàng quần áo của bạn chưa được thanh toán. Bạn có chắc chắn muốn rời đi? (Đơn hàng sẽ tự động hủy sau 15 phút)"
            );

            if (confirmLeave) {
                // Khách chọn OK (Muốn rời đi thật) -> Điều hướng về lại trang danh sách sản phẩm
                navigate('/category/all'); 
            } else {
                // Khách chọn Cancel (Ở lại thanh toán nốt) 
                // -> Tiếp tục nhét lại link hiện tại vào lịch sử để "khóa" nút Back cho lần bấm tiếp theo
                window.history.pushState(null, '', window.location.href);
            }
        };

        // Gắn bộ lắng nghe
        window.addEventListener('popstate', handlePopState);

        // Cleanup: Gỡ bộ lắng nghe khi trang bị hủy
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isTimeout, navigate]);

    // ĐỒNG HỒ ĐẾM NGƯỢC 15 PHÚT
    useEffect(() => {
        if (timeLeft <= 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsTimeout(true);
            return;
        }
        const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    // Hàm format thời gian ra dạng MM:SS
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };


    // POLLING API (Tự ngắt khi hết giờ)
    useEffect(() => {
        if (!orderId || isTimeout) return;

        // Tạo một vòng lặp, cứ 3000ms (3 giây) chạy 1 lần
        const intervalId = setInterval(async () => {
            try {
                const response = await orderService.checkPaymentStatus(orderId);
                const currentStatus = response.data;

                // Nếu Backend báo là PAID -> Dừng vòng lặp và chuyển trang
                if (currentStatus === 'PAID') {
                    clearInterval(intervalId); // Tắt đồng hồ
                    toast.success("Thanh toán thành công! Cảm ơn bạn.");
                    navigate(`/thank-you?orderId=${orderId}`);
                }
            } catch (error) {
                console.error("Lỗi khi kiểm tra trạng thái đơn hàng", error);
            }
        }, 3000);

        // Cleanup function: Khi người dùng rời khỏi trang QR (bấm nút Back), phải tắt vòng lặp đi
        return () => clearInterval(intervalId);
        
    }, [orderId, navigate, isTimeout]);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success("Đã sao chép!");
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleGoBack = () => {
        if (!isTimeout) {
            const confirmLeave = window.confirm("Đơn hàng của bạn chưa được thanh toán. Bạn có chắc chắn muốn rời đi? (Đơn hàng sẽ tự động hủy sau 15 phút)");
            if (!confirmLeave) return;
        }
        navigate('/category/all'); 
    };

    if (!orderId || !amount) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-4xl mx-auto px-4">
                
                {/* Nút quay lại */}
                <button 
                    onClick={handleGoBack}
                    className="flex items-center text-gray-500 hover:text-amber-600 font-medium mb-6 transition-colors"
                >
                    <ChevronLeft size={20} className="mr-1" />
                    {isTimeout  ? "Tiếp tục mua sắm" : "Rời khỏi trang thanh toán"}
                </button>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row relative">

                    {/* Lớp phủ mờ khi hết thời gian (Timeout Overlay) */}
                    {isTimeout && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6">
                            <XCircle className="text-red-500 mb-4 w-16 h-16" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Đã hết thời gian thanh toán</h2>
                            <p className="text-gray-600 mb-6">Mã QR này không còn hiệu lực. Đơn hàng của bạn đã bị hủy.</p>
                            <button 
                                onClick={() => navigate('/category/all')}
                                className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                            >
                                Đặt hàng lại
                            </button>
                        </div>
                    )}
                    
                    {/* CỘT TRÁI: HIỂN THỊ MÃ QR */}
                    <div className={`md:w-1/2 p-8 bg-amber-50 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-amber-100 ${isTimeout ? 'opacity-30' : ''}`}>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Thanh toán qua mã QR</h2>

                        {/* Đồng hồ đếm ngược */}
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-amber-200 text-amber-600 font-bold mb-6">
                            <Clock size={18} />
                            <span className="tracking-wider">{formatTime(timeLeft)}</span>
                        </div>

                        <p className="text-gray-600 mb-6 text-center text-sm">
                            Mở ứng dụng ngân hàng và quét mã bên dưới để thanh toán.
                        </p>

                        <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 relative">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-500 rounded-tl-xl -translate-x-1 -translate-y-1"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-500 rounded-tr-xl translate-x-1 -translate-y-1"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-500 rounded-bl-xl -translate-x-1 translate-y-1"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-500 rounded-br-xl translate-x-1 translate-y-1"></div>
                            
                            {/* Ảnh QR */}
                            <img src={qrUrl} alt="VietQR" className="w-64 h-64 object-contain" />
                        </div>

                        {!isTimeout && (
                            <div className="mt-8 flex items-center justify-center gap-2 text-amber-600 font-bold bg-amber-100/50 px-6 py-3 rounded-full animate-pulse">
                                <Loader2 className="animate-spin" size={20} />
                                Hệ thống đang chờ nhận tiền...
                            </div>
                        )}
                    </div>

                    {/* CỘT PHẢI: CHUYỂN KHOẢN THỦ CÔNG */}
                    <div className="md:w-1/2 p-8 flex flex-col justify-center">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <AlertCircle size={20} className="text-blue-500" />
                            Hoặc chuyển khoản thủ công
                        </h3>

                        <div className="space-y-4">
                            {/* Số tiền */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center group">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Số tiền thanh toán</p>
                                    <p className="text-xl font-black text-amber-600">{formatCurrency(amount)}</p>
                                </div>
                                <button 
                                    onClick={() => handleCopy(amount.toString(), 'amount')}
                                    className="p-2 bg-white rounded-lg border border-gray-200 text-gray-400 hover:text-amber-500 hover:border-amber-200 transition-colors shadow-sm"
                                >
                                    {copiedField === 'amount' ? <CheckCircle2 className="text-green-500" size={20} /> : <Copy size={20} />}
                                </button>
                            </div>

                            {/* Nội dung */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center group">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Nội dung chuyển khoản (Bắt buộc)</p>
                                    <p className="text-lg font-bold text-gray-900">{transferContent}</p>
                                </div>
                                <button 
                                    onClick={() => handleCopy(transferContent, 'content')}
                                    className="p-2 bg-white rounded-lg border border-gray-200 text-gray-400 hover:text-amber-500 hover:border-amber-200 transition-colors shadow-sm"
                                >
                                    {copiedField === 'content' ? <CheckCircle2 className="text-green-500" size={20} /> : <Copy size={20} />}
                                </button>
                            </div>

                            {/* Info Ngân hàng */}
                            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Ngân hàng:</span>
                                    <span className="font-bold text-gray-900">{BANK_CONFIG.BANK_ID}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Số tài khoản:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-900">{BANK_CONFIG.ACCOUNT_NO}</span>
                                        <button onClick={() => handleCopy(BANK_CONFIG.ACCOUNT_NO, 'stk')} className="text-amber-500 hover:text-amber-600">
                                            {copiedField === 'stk' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Chủ tài khoản:</span>
                                    <span className="font-bold text-gray-900 uppercase">{BANK_CONFIG.ACCOUNT_NAME}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-blue-50 text-blue-800 text-sm rounded-xl border border-blue-100 leading-relaxed">
                            <strong>Lưu ý:</strong> Đơn hàng sẽ được tự động xác nhận trong vòng 1-3 phút sau khi bạn chuyển khoản thành công. Vui lòng giữ nguyên màn hình này!
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};