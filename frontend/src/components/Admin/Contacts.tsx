import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'replied';
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('กรุณาล็อกอินก่อน');
        }

        const response = await apiClient.get('/api/contacts', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const contactsData = response.data.map((contact: any) => ({
          id: contact.id,
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          message: contact.message,
          timestamp: new Date(contact.timestamp).toLocaleString(),
          status: contact.status,
        }));
        setContacts(contactsData);
      } catch (err: any) {
        console.error('Error fetching contacts:', err);
        setError(err.response?.data?.error || 'ไม่สามารถโหลดข้อมูลได้');
        if (err.response?.status === 401) {
          navigate('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [navigate]);

  const handleReply = (contactId: string) => {
    // ตัวอย่างการนำไปสู่หน้าตอบกลับ (อาจสร้างหน้าใหม่ หรือใช้ modal)
    navigate(`/admin/contacts/reply/${contactId}`);
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen font-sans text-white">
      <div className="max-w-[1400px] mx-auto px-5 py-20">
        <div className="flex justify-between items-center mb-6">
          <h1
            className="text-5xl font-bold uppercase text-center w-full"
            style={{
              background: 'linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient 8s linear infinite',
              backgroundSize: '300%',
            }}
          >
            การติดต่อ
          </h1>
          <button
            onClick={() => navigate('/admin/home#dashboard')}
            className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-xs font-medium text-white transition-all duration-300 hover:from-indigo-600 hover:to-purple-600"
          >
            กลับไปหน้าแดชบอร์ด
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <p className="text-center text-lg opacity-80 mb-10">
          รายการข้อความจากผู้ใช้
        </p>

        {loading ? (
          <div className="flex items-center justify-center mt-10">
            <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mr-4"></div>
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        ) : error ? (
          <div className="text-red-400 text-center mt-10">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all"
            >
              ลองโหลดใหม่
            </button>
          </div>
        ) : (
          <div className="mt-10">
            <div className="overflow-x-auto rounded-lg shadow-2xl">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3">ชื่อ</th>
                    <th scope="col" className="px-6 py-3">อีเมล</th>
                    <th scope="col" className="px-6 py-3">หัวข้อ</th>
                    <th scope="col" className="px-6 py-3">ข้อความ</th>
                    <th scope="col" className="px-6 py-3">วันที่ส่ง</th>
                    <th scope="col" className="px-6 py-3">สถานะ</th>
                    <th scope="col" className="px-6 py-3">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-slate-800 hover:bg-slate-900/50">
                      <td className="px-6 py-4">{contact.name}</td>
                      <td className="px-6 py-4">{contact.email}</td>
                      <td className="px-6 py-4">{contact.subject}</td>
                      <td className="px-6 py-4">{contact.message}</td>
                      <td className="px-6 py-4">{contact.timestamp}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            contact.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {contact.status === 'pending' ? 'รอดำเนินการ' : 'ตอบกลับแล้ว'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleReply(contact.id)}
                          className="px-3 py-1 bg-indigo-500 rounded-lg text-white hover:bg-indigo-600 transition-all"
                        >
                          ตอบกลับ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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

export default Contacts;