import { useState, useEffect } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { productService } from '@/services/productService';
import type { ProductResponse } from '@/types/product.types';
import { ProductCard } from '@/components/common/ProductCard';
import { Link } from 'react-router-dom';

export const HomePage = () => {
  const [promoProducts, setPromoProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPromotionalProducts = async () => {
      try {
        const response = await productService.getPromotionalProducts();
        setPromoProducts(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy sản phẩm khuyến mãi:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotionalProducts();
  }, []);

  return (
    <div className="w-full">
      {/* --- HERO BANNER --- */}
      <section className="relative bg-amber-50 overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/2 z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Trà sữa đậm vị,<br/>
              <span className="text-amber-500">Đậm đà thanh xuân!</span>
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-lg">
              Trải nghiệm hương vị trà sữa nguyên bản, được pha chế thủ công với nguyên liệu an toàn 100% dành riêng cho sinh viên Gia Định.
            </p>
            <button className="bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-amber-500 transition-all flex items-center gap-2">
              Khám phá thực đơn <ArrowRight size={20} />
            </button>
          </div>
          
          {/* Hình ảnh minh họa Banner */}
          <div className="md:w-1/2 relative">
            <div className="absolute inset-0 bg-amber-200 rounded-full blur-3xl opacity-50 transform translate-x-10 translate-y-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1592284441621-581ebd2e677d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="Milk tea" 
              className="relative z-10 w-full max-w-md mx-auto rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* --- SECTION: ƯU ĐÃI HÔM NAY --- */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                Ưu Đãi Hôm Nay
              </h2>
              <p className="text-gray-500 mt-2">Chớp ngay deal hời, mời crush đi chơi!</p>
            </div>
            <Link to={"/category/all"}  className="hidden md:flex text-amber-600 font-bold hover:text-amber-700 items-center gap-1">
              Xem tất cả <ArrowRight size={16} />
            </Link>
          </div>

          {/* Trạng thái Loading */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-amber-500" size={40} />
            </div>
          ) : promoProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl">
              Hiện tại chưa có chương trình khuyến mãi nào. Bạn quay lại sau nhé!
            </div>
          ) : (
            /* Lưới Sản phẩm: 1 cột mobile, 2 cột tablet, 4 cột desktop */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {promoProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};