import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('กรุณาล็อกอินก่อนส่งข้อความ');
      }

      await apiClient.post(
        '/api/contacts',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess('ส่งข้อความสำเร็จ! ทีมงานจะติดต่อกลับเร็วๆ นี้');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการส่งข้อความ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen font-sans text-white">
      <div className="max-w-[1400px] mx-auto px-5 py-20">
        <h1
          className="text-5xl font-bold uppercase text-center mb-6"
          style={{
            background: 'linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradient 8s linear infinite',
            backgroundSize: '300%',
          }}
        >
          ติดต่อเรา
        </h1>
        <p className="text-center text-lg opacity-80 mb-10">
          กรอกข้อมูลด้านล่างเพื่อส่งข้อความถึงเรา
        </p>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              ชื่อ
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              อีเมล
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-2">
              หัวข้อ
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              ข้อความ
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={5}
              required
            />
          </div>

          {error && <p className="text-red-400 text-center">{error}</p>}
          {success && <p className="text-green-400 text-center">{success}</p>}

          <div className="flex justify-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white font-medium hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50"
            >
              {loading ? 'กำลังส่ง...' : 'ส่งข้อความ'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/client/home')}
              className="px-6 py-2 bg-slate-700 rounded-lg text-white font-medium hover:bg-slate-600 transition-all"
            >
              กลับไปหน้าแรก
            </button>
          </div>
        </form>
      </div>

      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </div>
  );
};

export default ContactUs;