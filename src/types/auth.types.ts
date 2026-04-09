// Thông tin User trả về từ Backend
export interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

// Bọc Response chung của Backend
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timestamp: string;
}

// Payload gửi lên
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}