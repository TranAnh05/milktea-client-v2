/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/types/auth.types';
import { STORAGE_KEYS } from '@/config/constants';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  saveAuthInfo: (user: User, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Giữ trạng thái loading khi mới F5 web

  // Chạy 1 lần duy nhất khi load lại trang: Kiểm tra xem trong LocalStorage có lưu user cũ không
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false); // Check xong thì tắt loading
  }, []);

  // Hàm được gọi SAU KHI gọi API login thành công
  const saveAuthInfo = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  };

  // Hàm xử lý đăng xuất
  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    // Lưu ý: Việc redirect về trang chủ sẽ do Custom Hook xử lý
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, saveAuthInfo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};