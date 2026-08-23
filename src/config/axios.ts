import axios from 'axios';
import { BASE_URL, STORAGE_KEYS } from './constants';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data; 
  },
  (error) => {
    // Xử lý lỗi tập trung
    if (error.response) {
      const status = error.response.status;

      // Nếu Backend báo 401 Unauthorized (Token hết hạn hoặc sai mật khẩu)
      if (status === 401) {
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