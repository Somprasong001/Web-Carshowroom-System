import axios from 'axios';

// ดึง API_URL จาก environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export const register = async (name: string, email: string, password: string, role: string = 'client'): Promise<AuthResponse> => {
  try {
    console.log('Sending register request:', { name, email, password, role }); // Debug
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      name,
      email,
      password,
      role,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Register response:', response.data); // Debug
    return response.data;
  } catch (error: any) {
    console.error('Error in register:', error); // Debug
    if (error.response?.status === 404) {
      throw new Error('ไม่พบเส้นทาง API กรุณาตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่');
    }
    const errorMessage = error.response?.data?.error || error.message || 'การสมัครสมาชิกไม่สำเร็จ';
    throw new Error(errorMessage);
  }
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Sending login request:', { email, password }); // Debug
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Login response:', response.data); // Debug
    return response.data;
  } catch (error: any) {
    console.error('Error in login:', error); // Debug
    if (error.response?.status === 404) {
      throw new Error('ไม่พบเส้นทาง API กรุณาตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่');
    }
    const errorMessage = error.response?.data?.error || error.message || 'รหัสผ่านไม่ถูกต้อง หรือ อีเมลนี้ยังไม่ได้ลงทะเบียน';
    throw new Error(errorMessage);
  }
};