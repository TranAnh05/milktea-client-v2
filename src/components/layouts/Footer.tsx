import { Link } from 'react-router-dom';
import {  MapPin, Phone, Mail } from 'lucide-react';
import {FaFacebook, FaInstagram, FaYoutube} from 'react-icons/fa'

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Cột 1: Brand */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                GD
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Milktea<span className="text-amber-500">.</span>
              </span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Thương hiệu trà sữa chuẩn vị nhà làm, mang đến những trải nghiệm ngọt ngào và an toàn nhất cho sinh viên Gia Định.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all"><FaFacebook size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all"><FaInstagram size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all"><FaYoutube size={18} /></a>
            </div>
          </div>

          {/* Cột 2: Liên kết */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Khám Phá</h3>
            <ul className="space-y-4">
              <li><Link to="/menu" className="hover:text-amber-500 transition-colors">Thực đơn</Link></li>
              <li><Link to="/about" className="hover:text-amber-500 transition-colors">Về chúng tôi</Link></li>
              <li><Link to="/blog" className="hover:text-amber-500 transition-colors">Blog Trà Sữa</Link></li>
              <li><Link to="/stores" className="hover:text-amber-500 transition-colors">Hệ thống cửa hàng</Link></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Chính Sách</h3>
            <ul className="space-y-4">
              <li><Link to="/policy/shipping" className="hover:text-amber-500 transition-colors">Chính sách giao hàng</Link></li>
              <li><Link to="/policy/privacy" className="hover:text-amber-500 transition-colors">Bảo mật thông tin</Link></li>
              <li><Link to="/faq" className="hover:text-amber-500 transition-colors">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Liên Hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-amber-500 shrink-0 mt-1" />
                <span>371 Nguyễn Kiệm, Phường 3, Gò Vấp, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-amber-500 shrink-0" />
                <span>1900 xxxx</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-amber-500 shrink-0" />
                <span>support@gd-milktea.vn</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© 2026 Gia Dinh Milktea. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-white transition-colors">Điều khoản</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};