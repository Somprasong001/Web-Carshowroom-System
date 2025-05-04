import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string, role: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // ตรวจสอบ token จาก localStorage เมื่อโหลดหน้า
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const storedUser = localStorage.getItem('user');

    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, role: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUserRole(role);
    setUser(userData);
    console.log('AuthContext login:', { token, role, user: userData }); // Debug
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null);
    console.log('AuthContext logout'); // Debug
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};