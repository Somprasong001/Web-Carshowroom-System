import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import validator from 'validator';

// API URL Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const { login, isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AuthForm rendered, isLogin:', isLogin, 'showForgotPassword:', showForgotPassword);
    console.log('AuthForm useEffect - Auth state:', { isAuthenticated, userRole });
    if (isAuthenticated && userRole) {
      console.log('Navigating to:', userRole === 'admin' ? '/admin/home' : '/client/home');
      navigate(userRole === 'admin' ? '/admin/home' : '/client/home', { replace: true });
    }
  }, [isAuthenticated, userRole, navigate, isLogin, showForgotPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Trim whitespace จาก input
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    // ตรวจสอบข้อมูลเพิ่มเติม
    if (!trimmedEmail) {
      setError('กรุณากรอกอีเมล');
      setLoading(false);
      return;
    }
    if (!validator.isEmail(trimmedEmail)) {
      setError('กรุณากรอกอีเมลที่ถูกต้อง');
      setLoading(false);
      return;
    }

    if (!trimmedPassword) {
      setError('กรุณากรอกรหัสผ่าน');
      setLoading(false);
      return;
    }
    if (!validator.isLength(trimmedPassword, { min: 6 })) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (!trimmedName) {
        setError('กรุณากรอกชื่อสำหรับการสมัครสมาชิก');
        setLoading(false);
        return;
      }
      if (!validator.isLength(trimmedName, { min: 1 })) {
        setError('ชื่อต้องมีความยาวอย่างน้อย 1 ตัวอักษร (ไม่นับช่องว่าง)');
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: trimmedEmail, password: trimmedPassword }
        : { name: trimmedName, email: trimmedEmail, password: trimmedPassword, role: 'client' };
      console.log('Sending payload to', `${API_URL}${endpoint}:`, payload);

      const response = await axios.post(`${API_URL}${endpoint}`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response from server:', response.data);

      const { token, user } = response.data;

      if (!user || !user.role) {
        throw new Error('การตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้อง: ไม่พบข้อมูลบทบาทผู้ใช้');
      }

      login(token, user.role, user);
      console.log('Login called with:', { token, role: user.role, user });

      setSuccess(`${isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}สำเร็จ! กำลังเปลี่ยนเส้นทาง...`);

      // เปลี่ยนเส้นทางหลังจาก 2 วินาทีเพื่อให้ผู้ใช้เห็นข้อความสำเร็จ
      setTimeout(() => {
        const destination = user.role === 'admin' ? '/admin/home' : '/client/home';
        console.log('Navigating to after success:', destination);
        navigate(destination, { replace: true });
      }, 2000);
    } catch (err: any) {
      console.error('Auth error:', err.response || err.message);
      if (err.response) {
        const errorMessage = err.response.data.error || err.response.data.message || 'การยืนยันตัวตนล้มเหลว';
        setError(errorMessage);
      } else if (err.request) {
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือ backend');
      } else {
        setError(err.message || 'เกิดข้อผิดพลาดบางอย่าง');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const trimmedForgotEmail = forgotEmail.trim();
    if (!trimmedForgotEmail || !validator.isEmail(trimmedForgotEmail)) {
      setError('กรุณากรอกอีเมลที่ถูกต้อง');
      setLoading(false);
      return;
    }

    try {
      console.log(`Sending forgot password request to ${API_URL}/auth/forgot-password with email:`, trimmedForgotEmail);
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email: trimmedForgotEmail }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Forgot password response:', response.data);
      setSuccess('ส่งคำแนะนำการรีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมาย!');
      setForgotEmail('');
      setTimeout(() => setShowForgotPassword(false), 2000);
    } catch (err: any) {
      console.error('Forgot password error:', err.response || err.message);
      if (err.response) {
        const errorMessage = err.response.data.error || err.response.data.message || 'ไม่สามารถส่งคำแนะนำได้';
        setError(errorMessage);
      } else if (err.request) {
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่');
      } else {
        setError('เกิดข้อผิดพลาดบางอย่าง');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleForm = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
    setName('');
    setEmail('');
    setPassword('');
    setForgotEmail('');
    setShowForgotPassword(false);
  };

  return (
    <div
      className="bg-[#0a0a0a] h-screen w-screen flex items-center justify-center px-4 bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
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
          {isLogin ? (showForgotPassword ? 'ลืมรหัสผ่าน' : 'เข้าสู่ระบบ') : 'สมัครสมาชิก'}
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

        {/* Login Form */}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#ff3366] to-[#4834d4] text-white rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'กำลังดำเนินการ...' : 'เข้าสู่ระบบ'}
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
                onClick={handleToggleForm}
                className="text-[#ff3366] hover:underline"
              >
                สมัครสมาชิก
              </button>
            </p>
          </form>
        )}

        {/* Register Form */}
        {!isLogin && !showForgotPassword && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-1 text-sm sm:text-base">ชื่อ</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#1f2029] text-white border-none focus:outline-none focus:ring-2 focus:ring-[#ff3366] text-sm sm:text-base"
                placeholder="กรอกชื่อของคุณ"
                required
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#ff3366] to-[#4834d4] text-white rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'กำลังดำเนินการ...' : 'สมัครสมาชิก'}
            </button>
            <p className="text-gray-300 text-center mt-4 text-sm sm:text-base">
              มีบัญชีแล้ว?{' '}
              <button
                onClick={handleToggleForm}
                className="text-[#ff3366] hover:underline"
              >
                เข้าสู่ระบบ
              </button>
            </p>
          </form>
        )}

        {/* Forgot Password Form */}
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
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#ff3366] to-[#4834d4] text-white rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'กำลังส่ง...' : 'ส่งคำแนะนำการรีเซ็ต'}
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

        {/* ปุ่มไปหน้า Admin Login */}
        <p className="text-gray-300 text-center mt-4 text-sm sm:text-base">
          คุณเป็นผู้ดูแล?{' '}
          <button
            onClick={() => navigate('/admin/login')}
            className="text-[#ff3366] hover:underline"
          >
            ไปที่หน้าเข้าสู่ระบบสำหรับผู้ดูแล
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthForm; 