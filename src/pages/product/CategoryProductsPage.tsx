/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LayoutGrid, ChevronRight } from 'lucide-react';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { ProductCard } from '@/components/common/ProductCard'; 
import type { ProductResponse } from '@/types/product.types';
import type { CategoryResponse } from '@/types/category.types';
import toast from 'react-hot-toast';
import SelectOption, { type OptionItem } from '@/components/common/SelectOption';

const sortOptions: OptionItem[] = [
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Giá: Thấp đến Cao', value: 'price_asc' },
    { label: 'Giá: Cao đến Thấp', value: 'price_desc' },
];

export default function CategoryProductsPage() {
  const { slug } = useParams<{ slug: string }>();
  const activeSlug = slug || 'all'; // Mặc định là 'all' nếu ở trang /products

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [sortValue, setSortValue] = useState<string>('newest');

  // 1. Lấy danh sách Categories cho Sidebar (Chỉ chạy 1 lần)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getActiveCategories();
        if (response.data) setCategories(response.data);
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // 2. Lấy danh sách Sản phẩm mỗi khi 'activeSlug' thay đổi
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const res = await productService.getProductsByCategorySlug(activeSlug);
        if (res.data?.content) {
          setProducts(res.data.content);
        } else if (res.data) {
          setProducts(res.data as ProductResponse[]);
        }
      } catch (error) {
        toast.error("Không thể tải danh sách sản phẩm lúc này.");
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [activeSlug]);

  // Tìm tên danh mục hiện tại để hiển thị trên Title
  const currentCategoryName = activeSlug === 'all' 
    ? 'Tất cả sản phẩm' 
    : categories.find(c => c.slug === activeSlug)?.name || 'Sản phẩm';

  return (
      <div className="container mx-auto px-4 md:px-8">
        
        {/* --- BREADCRUMB --- */}
        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-amber-500 transition-colors">Trang chủ</Link>
          <ChevronRight size={16} className="mx-2" />
          <Link to="/category/all" className="hover:text-amber-500 transition-colors">Thực đơn</Link>
          {activeSlug !== 'all' && (
            <>
              <ChevronRight size={16} className="mx-2" />
              <span className="text-gray-900 font-medium">{currentCategoryName}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ================= SIDEBAR (BÊN TRÁI) ================= */}
          <div className="w-full lg:w-1/4 shrink-0">
            {/* Sticky giúp sidebar luôn cố định khi cuộn danh sách sản phẩm */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <LayoutGrid className="text-amber-500" size={20} />
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                  Danh mục
                </h2>
              </div>

              {isLoadingCategories ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {/* Nút Tất cả sản phẩm */}
                  <li>
                    <Link
                      to="/category/all"
                      className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        activeSlug === 'all'
                          ? 'bg-amber-50 text-amber-600 shadow-inner'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-amber-500'
                      }`}
                    >
                      Tất cả sản phẩm
                    </Link>
                  </li>

                  {/* Render các Category */}
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        to={`/category/${cat.slug}`}
                        className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          activeSlug === cat.slug
                            ? 'bg-amber-50 text-amber-600 shadow-inner'
                            : 'text-gray-600 hover:gray-50 hover:text-amber-500'
                        }`}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ================= KHU VỰC SẢN PHẨM (BÊN PHẢI) ================= */}
          <div className="w-full lg:w-3/4">
            
            {/* Tiêu đề & Bộ lọc Sort (Giao diện giả lập Sort cho đẹp mắt) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {currentCategoryName} <span className="text-gray-400 text-lg font-medium ml-2">({products.length})</span>
              </h1>
              
              <div className="flex items-center gap-2 text-sm">
                <SelectOption
                  label="Sắp xếp:"
                  options={sortOptions}
                  value={sortValue}
                  onChange={(val: string) => setSortValue(val)}
                />
              </div>
            </div>

            {/* Lưới sản phẩm */}
            {isLoadingProducts ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-87.5 bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse p-4 flex flex-col">
                    <div className="h-40 bg-gray-200 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-auto"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3 mt-4"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <LayoutGrid className="text-gray-300" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Chưa có sản phẩm</h3>
                <p className="text-gray-500 max-w-sm">Hiện tại chưa có sản phẩm nào thuộc danh mục này. Vui lòng quay lại sau nhé!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  // NHÚNG COMPONENT CỦA EM VÀO ĐÂY
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
  );
}