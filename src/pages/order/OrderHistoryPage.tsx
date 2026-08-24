/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/OrderHistoryPage.tsx
import { useState, useEffect } from 'react';
import { orderService } from '@/services/orderService';
import OrderCard from '@/components/order/OrderCard';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Định nghĩa các Tab
const TABS = [
  { id: '', label: 'Tất cả' },
  { id: 'PENDING', label: 'Chờ xác nhận' },
  {id: 'CONFIRMED', label:  "Đã xác nhận"},
  { id: 'PREPARING', label: 'Đang pha chế' },
  { id: 'DELIVERING', label: 'Đang giao' },
  { id: 'COMPLETED', label: 'Hoàn thành' },
  { id: 'CANCELLED', label: 'Đã hủy' },
];

export default function OrderHistoryPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hàm gọi API
  const fetchOrders = async (status: string) => {
    setIsLoading(true);
    try {
      // Gọi hàm từ orderService (em nhớ tạo hàm này trong file service nhé)
      const res = await orderService.getMyOrders(status || null, 0, 10); 
      if (res.data?.content) {
        setOrders(res.data.content);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng.");
    } finally {
      setIsLoading(false);
    }
  };

  // Tự động gọi API mỗi khi activeTab thay đổi
  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  // Hàm được gọi khi 1 đơn hàng bị hủy thành công để reload lại trang
  const handleOrderCancelled = () => {
    fetchOrders(activeTab);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Đơn hàng của tôi</h1>

      {/* THANH TABS CUỘN NGANG (Cực xịn trên Mobile) */}
      <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200 mb-6 pb-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-2 font-medium text-sm transition-colors border-b-2 
              ${activeTab === tab.id 
                ? 'border-orange-500 text-orange-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* DANH SÁCH ĐƠN HÀNG */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Đang tải dữ liệu... (Có thể thay bằng Skeleton loading)</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed">
            <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào ở trạng thái này.</p>
            <button onClick={() => navigate('/category/all')} className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              Đi đặt trà sữa ngay
            </button>
          </div>
        ) : (
          orders.map(order => (
            <OrderCard 
              key={order.orderId} 
              order={order} 
              onCancelSuccess={handleOrderCancelled} 
            />
          ))
        )}
      </div>
    </div>
  );
}