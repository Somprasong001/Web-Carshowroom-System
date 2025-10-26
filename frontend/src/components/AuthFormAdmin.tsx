import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

// API URL Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AuthFormAdmin: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');

  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  useEffect(() => {
    if (!isLoading && success) {
      setTimeout(() => navigate('/admin/home', { replace: true }), 1000);
    }
  }, [isLoading, success, navigate]);

  const handleToggle = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError(null);
    setSuccess(null);
    setForgotEmail('');
    setShowForgotPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Validation
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? `${API_URL}/auth/login` : `${API_URL}/auth/register`;
      
      // Prepare request body
      const body = isLogin 
        ? { email: email.trim(), password }
        : { 
            name: name.trim() || email.split('@')[0],
            email: email.trim(), 
            password,
            role: 'admin'
          };

      console.log('Sending request to:', endpoint);
      console.log('Request body:', { ...body, password: '***' });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'เกิดข้อผิดพลาด');
      }

      // Check if user is admin
      if (data.user && data.user.role !== 'admin') {
        throw new Error('การเข้าถึงถูกปฏิเสธ ต้องมีบทบาทเป็นผู้ดูแลระบบ');
      }

      const successMessage = `${isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}สำเร็จ! กำลังเปลี่ยนเส้นทาง...`;
      setSuccess(successMessage);
      
      // Login to auth context
      authLogin(
        data.token, 
        'admin', 
        { 
          name: data.user.name || data.user.email.split('@')[0], 
          email: data.user.email 
        }
      );
      
      resetForm();
    } catch (err: any) {
      console.error('Error:', err);
      let errorMessage = err.message || (isLogin ? 'การเข้าสู่ระบบล้มเหลว' : 'การสมัครสมาชิกไม่สำเร็จ');
      
      // Handle specific errors
      if (errorMessage.includes('already exists') || errorMessage.includes('มีผู้ใช้งานแล้ว')) {
        errorMessage = 'อีเมลนี้มีผู้ใช้งานแล้ว กรุณาเข้าสู่ระบบ';
        setTimeout(() => {
          setIsLogin(true);
          resetForm();
        }, 2000);
      } else if (errorMessage.includes('Invalid') || errorMessage.includes('ไม่ถูกต้อง')) {
        errorMessage = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      console.log(`ส่งอีเมลรีเซ็ตรหัสผ่านไปที่: ${forgotEmail}`);
      setSuccess('ส่งคำแนะนำการรีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว');
      setForgotEmail('');
      setTimeout(() => setShowForgotPassword(false), 2000);
    } catch (err: any) {
      setError('ไม่สามารถส่งคำแนะนำการรีเซ็ตได้ กรุณาลองใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="bg-[#0a0a0a] h-screen w-screen flex items-center justify-center px-4 bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop')`,
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-[90%] min-w-[320px] max-w-[600px] mx-auto bg-[rgba(255,255,255,0.05)] backdrop-blur-md p-6 sm:p-8 rounded-lg shadow-lg"
      >
        <motion.h2
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="text-2xl sm:text-3xl font-bold text-white text-center mb-6"
        >
          {isLogin
            ? showForgotPassword
              ? 'ลืมรหัสผ่าน'
              : 'เข้าสู่ระบบสำหรับผู้ดูแล'
            : 'สมัครสมาชิกสำหรับผู้ดูแล'}
        </motion.h2>
        
        {error && (
          <p className="text-red-500 text-center bg-[rgba(255,0,0,0.1)] p-2 rounded-lg mb-4 text-sm sm:text-base">
            {error}
          </p>
        )}
        
        {success && (
          <p className="text-green-500 text-center bg-[rgba(0,255,0,0.1)] p-2 rounded-lg mb-4 text-sm sm:text-base">
            {success}
          </p>
        )}

        {isLogin && !showForgotPassword && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-1 text-sm sm:text-base">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#1f2029] text-white border-none focus:outline-none focus:ring-2 focus:ring-[#ff3366] text-sm sm:text-base"
                placeholder="กรอกอีเมลของคุณ"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1 text-sm sm:text-base">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#1f2029] text-white border-none focus:outline-none focus:ring-2 focus:ring-[#ff3366] text-sm sm:text-base"
                placeholder="กรอกรหัสผ่านของคุณ (อย่างน้อย 6 ตัวอักษร)"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#ff3366] to-[#4834d4] text-white rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? 'กำลังดำเนินการ...' : 'เข้าสู่ระบบ'}
            </button>
            <p className="text-gray-300 text-center mt-4 text-sm sm:text-base">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-[#ff3366] hover:underline"
              >
                ลืมรหัสผ่าน?
              </button>
            </p>
            <p className="text-gray-300 text-center mt-2 text-sm sm:text-base">
              ยังไม่มีบัญชี?{' '}
              <button
                type="button"
                onClick={handleToggle}
                className="text-[#ff3366] hover:underline"
              >
                สมัครสมาชิก
              </button>
            </p>
          </form>
        )}

        {!isLogin && !showForgotPassword && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-1 text-sm sm:text-base">ชื่อ (ไม่บังคับ)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#1f2029] text-white border-none focus:outline-none focus:ring-2 focus:ring-[#ff3366] text-sm sm:text-base"
                placeholder="กรอกชื่อของคุณ"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1 text-sm sm:text-base">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#1f2029] text-white border-none focus:outline-none focus:ring-2 focus:ring-[#ff3366] text-sm sm:text-base"
                placeholder="กรอกอีเมลของคุณ"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1 text-sm sm:text-base">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#1f2029] text-white border-none focus:outline-none focus:ring-2 focus:ring-[#ff3366] text-sm sm:text-base"
                placeholder="กรอกรหัสผ่านของคุณ (อย่างน้อย 6 ตัวอักษร)"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#ff3366] to-[#4834d4] text-white rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? 'กำลังดำเนินการ...' : 'สมัครสมาชิก'}
            </button>
            <p className="text-gray-300 text-center mt-4 text-sm sm:text-base">
              มีบัญชีแล้ว?{' '}
              <button
                type="button"
                onClick={handleToggle}
                className="text-[#ff3366] hover:underline"
              >
                เข้าสู่ระบบ
              </button>
            </p>
          </form>
        )}

        {showForgotPassword && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-1 text-sm sm:text-base">อีเมล</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#1f2029] text-white border-none focus:outline-none focus:ring-2 focus:ring-[#ff3366] text-sm sm:text-base"
                placeholder="กรอกอีเมลของคุณ"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#ff3366] to-[#4834d4] text-white rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? 'กำลังส่ง...' : 'ส่งคำแนะนำการรีเซ็ต'}
            </button>
            <p className="text-gray-300 text-center mt-4 text-sm sm:text-base">
              กลับไปที่{' '}
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-[#ff3366] hover:underline"
              >
                เข้าสู่ระบบ
              </button>
            </p>
          </form>
        )}

        <p className="text-gray-300 text-center mt-4 text-sm sm:text-base">
          ไม่ใช่ผู้ดูแล?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-[#ff3366] hover:underline"
          >
            ไปที่หน้าเข้าสู่ระบบสำหรับลูกค้า
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthFormAdmin;