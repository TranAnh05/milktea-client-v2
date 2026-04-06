import axios from 'axios';
import { BASE_URL, STORAGE_KEYS } from './constants';

// 1. Khởi tạo một instance của Axios
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // timeout: 10000, // Có thể thiết lập tự động hủy request nếu server phản hồi quá 10s
});

// 2. Request Interceptor (Can thiệp trước khi gửi API lên Backend)
axiosInstance.interceptors.request.use(
  (config) => {
    // Tìm thẻ thông hành (Token) trong Local Storage
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    // Nếu có token, tự động móc nó vào Header Authorization của mọi API
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor (Can thiệp khi Backend trả kết quả về)
axiosInstance.interceptors.response.use(
  (response) => {
    // Phép thuật ở đây: Vì Backend Spring Boot đã bọc dữ liệu bằng class ApiResponse<T>
    // Nên chúng ta bóc luôn lớp vỏ response mặc định của Axios, chỉ lấy response.data
    return response.data; 
  },
  (error) => {
    // Xử lý lỗi tập trung
    if (error.response) {
      const status = error.response.status;

      // Nếu Backend báo 401 Unauthorized (Token hết hạn hoặc sai mật khẩu)
      if (status === 401) {
        // Xóa token cũ rác đi
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_INFO);
        
        // Nếu không phải đang ở trang login thì mới đá văng ra ngoài
        if (window.location.pathname !== '/login') {
            window.location.href = '/login?expired=true';
        }
      }

      // Trả lại đúng cái cục JSON ErrorResponse mà file GlobalExceptionHandler của Backend ném ra
      return Promise.reject(error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;