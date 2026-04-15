import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Copy, CheckCircle2, AlertCircle, ChevronLeft, Loader2 } from 'lucide-react';
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

    // Sinh nội dung chuyển khoản bắt buộc: "TS ORD-xxxx" (TS = Trà Sữa)
    const transferContent = `TS ${orderId}`;

    const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.BANK_ID}-${BANK_CONFIG.ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${transferContent}&accountName=${BANK_CONFIG.ACCOUNT_NAME}`;

    useEffect(() => {
        if (!orderId || !amount) {
            toast.error("Thông tin thanh toán không hợp lệ!");
            navigate('/');
        }
    }, [orderId, amount, navigate]);

    useEffect(() => {
        if (!orderId) return;

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
        
    }, [orderId, navigate]);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success("Đã sao chép!");
        setTimeout(() => setCopiedField(null), 2000);
    };

    if (!orderId || !amount) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-4xl mx-auto px-4">
                
                {/* Nút quay lại */}
                <button 
                    onClick={() => navigate('/category/all')}
                    className="flex items-center text-gray-500 hover:text-amber-600 font-medium mb-6 transition-colors"
                >
                    <ChevronLeft size={20} className="mr-1" />
                    Tiếp tục mua sắm
                </button>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                    
                    {/* CỘT TRÁI: HIỂN THỊ MÃ QR */}
                    <div className="md:w-1/2 p-8 bg-amber-50 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-amber-100">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Thanh toán qua mã QR</h2>
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

                        <div className="mt-8 flex items-center justify-center gap-2 text-amber-600 font-bold bg-amber-100/50 px-6 py-3 rounded-full animate-pulse">
                            <Loader2 className="animate-spin" size={20} />
                            Hệ thống đang chờ nhận tiền...
                        </div>
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