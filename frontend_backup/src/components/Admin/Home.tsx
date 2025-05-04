import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface DashboardData {
  registerData: { date: string; count: number }[];
  loginData: { date: string; count: number }[];
  totalRegisters: number;
  totalLogins: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  file_name: string | null;
  created_at: string;
}

interface Notification {
  id: number;
  message: string;
  timestamp: string;
}

interface RecentActivity {
  message: string;
  timestamp: string;
}

interface ReportData {
  userActivity?: { date: string; count: number }[];
  registrationTrends?: { date: string; count: number }[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const Card: React.FC<{
  title: string;
  total: number;
  percentage: string;
  data: { date: string; count: number }[];
  chartData: { labels: string[]; data: number[] };
}> = ({ title, total, percentage, data, chartData }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { display: false },
      y: { display: false },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  const chartDataConfig = {
    labels: chartData.labels,
    datasets: [
      {
        data: chartData.data,
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.3)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="group relative flex w-80 flex-col rounded-xl bg-slate-950 p-4 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/20">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
      <div className="absolute inset-px rounded-[11px] bg-slate-950" />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-slate-900/50 p-3">
            <p className="text-xs font-medium text-slate-400">Total</p>
            <p className="text-lg font-semibold text-white">{total}</p>
            <span className="text-xs font-medium text-emerald-500">{percentage}</span>
          </div>
          <div className="rounded-lg bg-slate-900/50 p-3">
            <p className="text-xs font-medium text-slate-400">Last Day</p>
            <p className="text-lg font-semibold text-white">{data[0]?.count || 0}</p>
            <span className="text-xs font-medium text-emerald-500">Recent</span>
          </div>
        </div>
        <div className="mb-4 h-24 w-full overflow-hidden rounded-lg bg-slate-900/50 p-3">
          <Line data={chartDataConfig} options={chartOptions} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Last 7 days</span>
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <button
            onClick={() => window.location.href = '/admin/activity-details'}
            className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-xs font-medium text-white transition-all duration-300 hover:from-indigo-600 hover:to-purple-600"
          >
            View Details
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [activeLink, setActiveLink] = useState<string>('#dashboard');
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState<boolean>(false); // State for More dropdown
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [adminEmail, setAdminEmail] = useState<string>('admin@example.com');
  const [theme, setTheme] = useState<string>('dark');
  const [reportData, setReportData] = useState<ReportData>({});
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'client' });
  const { logout, userRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const navRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!isAuthenticated) {
          throw new Error('ผู้ใช้ไม่ได้ยืนยันตัวตน');
        }

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('ไม่พบโทเค็นการยืนยันตัวตน');
        }

        const response = await apiClient.get('/api/auth/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDashboardData(response.data);

        const recentActivityResponse = await apiClient.get('/api/auth/recent-activity', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const activities = recentActivityResponse.data.map((activity: any, index: number) => ({
          message: activity.message,
          timestamp: new Date(activity.timestamp).toLocaleString(),
        }));
        setRecentActivities(activities);
      } catch (error: any) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลแดชบอร์ด:', error);
        setError(error.response?.data?.error || 'ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
        if (error.response?.status === 401) {
          logout();
          navigate('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [isAuthenticated, logout, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('ไม่พบโทเค็นการยืนยันตัวตน');
        }

        const response = await apiClient.get('/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
      } catch (error: any) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchContactMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('ไม่พบโทเค็นการยืนยันตัวตน');
        }

        const response = await apiClient.get('/api/contacts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setContactMessages(response.data);
      } catch (error: any) {
        console.error('Error fetching contact messages:', error);
      }
    };
    fetchContactMessages();
  }, []);

  useEffect(() => {
    const fetchAdminEmail = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('ไม่พบโทเค็นการยืนยันตัวตน');
        }

        const response = await apiClient.get('/api/users/admin-email', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAdminEmail(response.data.email);
      } catch (error: any) {
        console.error('Error fetching admin email:', error);
      }
    };
    fetchAdminEmail();

    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.body.classList.toggle('light', savedTheme === 'light');
  }, []);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notification' && (data.event === 'login' || data.event === 'register')) {
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: data.message,
            timestamp: new Date().toLocaleString(),
          },
        ]);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : 'auto';
  };

  const handleLinkClick = (href: string) => {
    setActiveLink(href);
    setIsMoreDropdownOpen(false); // ปิด dropdown เมื่อเลือกเมนู
    if (isMenuOpen) toggleMenu();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      await apiClient.delete(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error: any) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEditUser = (user: User) => {
    navigate(`/admin/users/edit/${user.id}`);
  };

  const handleViewContact = (contact: ContactMessage) => {
    setSelectedContact(contact);
    setShowContactModal(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const token = localStorage.getItem('token');
      await apiClient.delete(`/api/contacts/${contactId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setContactMessages(contactMessages.filter((msg) => msg.id !== contactId));
    } catch (error: any) {
      console.error('Error deleting contact message:', error);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('theme', theme);
    document.body.classList.toggle('light', theme === 'light');
  };

  const handleGenerateReport = async (type: 'userActivity' | 'registrationTrends') => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'userActivity' ? '/api/reports/user-activity' : '/api/reports/registration-trends';
      const response = await apiClient.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReportData((prev) => ({
        ...prev,
        [type]: response.data,
      }));
    } catch (error: any) {
      console.error(`Error generating ${type} report:`, error);
    }
  };

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem('token');
      await apiClient.post('/api/users', newUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers([...users, { ...newUser, id: Date.now().toString(), status: 'Inactive' }]);
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'client' });
    } catch (error: any) {
      console.error('Error adding user:', error);
    }
  };

  const navbarStyle = {
    backdropFilter: 'blur(12px)',
    background: 'rgba(255, 255, 255, 0.05)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '100%',
    ...(isScrolled && {
      padding: '0.8rem 5%',
      background: 'rgba(10, 10, 10, 0.95)',
    }),
  };

  const logoStyle = {
    background: 'linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'gradient 8s linear infinite',
    backgroundSize: '300%',
    letterSpacing: '-0.5px',
  };

  const navLinkStyle = (isActive: boolean) => ({
    color: isActive ? 'transparent' : 'white',
    background: isActive
      ? 'linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0)'
      : 'none',
    WebkitBackgroundClip: isActive ? 'text' : 'none',
    backgroundClip: isActive ? 'text' : 'none',
    WebkitTextFillColor: isActive ? 'transparent' : 'white',
    animation: isActive ? 'gradient 8s linear infinite' : 'none',
    backgroundSize: isActive ? '300%' : 'none',
    textDecoration: 'none',
    fontWeight: 500,
    padding: '0.5rem 1rem',
    transition: 'all 0.3s ease',
    fontSize: '1.05rem',
    letterSpacing: '0.3px',
    position: 'relative' as const,
    whiteSpace: 'nowrap' as const,
  });

  const navLinkBeforeAfterStyle = {
    content: "''",
    position: 'absolute',
    height: '2px',
    background: 'linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0)',
    backgroundSize: '300%',
    transition: 'width 0.3s ease',
  };

  const sectionStyle = {
    minHeight: '100vh',
    padding: '120px 5% 80px',
    position: 'relative' as const,
    overflow: 'hidden',
    width: '100%',
    boxSizing: 'border-box' as const,
  };

  const sectionContentStyle = {
    maxWidth: '1400px',
    width: '100%',
    position: 'relative' as const,
    zIndex: 1,
    margin: '0 auto',
  };

  const sectionTitleStyle = {
    fontSize: 'clamp(3rem, 8vw, 6rem)',
    fontWeight: 800,
    marginBottom: '1rem',
    background: 'linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'gradient 8s linear infinite',
    backgroundSize: '300%',
    lineHeight: 1.1,
    textTransform: 'uppercase' as const,
    letterSpacing: '-2px',
    textAlign: 'center' as const,
  };

  const sectionDescriptionStyle = {
    fontSize: 'clamp(1rem, 1.2rem, 1.5rem)',
    maxWidth: '800px',
    margin: '0 auto 2rem',
    lineHeight: 1.6,
    opacity: 0.8,
    color: 'white',
    textAlign: 'center' as const,
  };

  const bgEffectStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 70%)',
    zIndex: 0,
  };

  return (
    <div className={`bg-[#0a0a0a] min-h-screen font-sans w-full ${theme}`}>
      <nav className="navbar fixed top-0 left-0 w-full px-5 py-3 z-50" style={navbarStyle}>
        <div className="navbar-container max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="logo text-2xl font-bold" style={logoStyle}>
            Admin Panel
          </div>
          <button
            className="mobile-nav-toggle md:hidden bg-transparent border-none cursor-pointer w-10 h-10 relative z-[1001] rounded-full transition-colors hover:bg-[rgba(255,255,255,0.1)]"
            aria-label="Toggle navigation"
            onClick={toggleMenu}
          >
            <span
              className="bar absolute left-1/2 transform -translate-x-1/2 w-5 h-[2px] bg-white transition-all duration-400"
              style={{ top: '14px', ...(isMenuOpen && { transform: 'translate(-50%, 5px) rotate(45deg)', width: '24px' }) }}
            />
            <span
              className="bar absolute left-1/2 transform -translate-x-1/2 w-5 h-[2px] bg-white transition-opacity duration-400"
              style={{ top: '19px', ...(isMenuOpen && { opacity: 0 }) }}
            />
            <span
              className="bar absolute left-1/2 transform -translate-x-1/2 w-5 h-[2px] bg-white transition-all duration-400"
              style={{ top: '24px', ...(isMenuOpen && { transform: 'translate(-50%, -5px) rotate(-45deg)', width: '24px' }) }}
            />
          </button>
          <div className="nav-wrapper relative md:flex items-center">
            <ul
              ref={navRef}
              className={`nav-links flex gap-4 list-none ${isMenuOpen ? 'active' : ''} md:flex md:static md:h-auto md:w-auto md:bg-transparent md:shadow-none md:backdrop-filter-none md:p-0 md:gap-4 absolute top-0 right-[-100%] h-screen w-[80%] max-w-[400px] flex-col justify-center items-center gap-8 p-8 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:transition-none bg-transparent shadow-[-10px_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md md:overflow-x-auto md:flex-row md:justify-start md:mx-8`}
            >
              <li><a href="#dashboard" onClick={() => handleLinkClick('#dashboard')} style={navLinkStyle(activeLink === '#dashboard')}>Dashboard</a></li>
              <li><a href="#users" onClick={() => handleLinkClick('#users')} style={navLinkStyle(activeLink === '#users')}>Users</a></li>
              <li><a href="#contacts" onClick={() => handleLinkClick('#contacts')} style={navLinkStyle(activeLink === '#contacts')}>Contacts</a></li>
              <li className="relative">
                <button
                  onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                  style={navLinkStyle(activeLink === '#settings' || activeLink === '#reports')}
                  className="flex items-center gap-1"
                >
                  More
                  <svg className={`h-4 w-4 transition-transform ${isMoreDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isMoreDropdownOpen && (
                  <ul className="absolute top-full left-0 mt-2 w-48 rounded-lg bg-slate-950 shadow-lg md:bg-transparent md:shadow-none md:backdrop-blur-md md:rounded-none md:w-full md:static md:mt-0">
                    <li className="md:border-t md:border-slate-800">
                      <a
                        href="#settings"
                        onClick={() => handleLinkClick('#settings')}
                        style={navLinkStyle(activeLink === '#settings')}
                        className="block px-4 py-2 md:px-0 md:py-4"
                      >
                        Settings
                      </a>
                    </li>
                    <li className="md:border-t md:border-slate-800">
                      <a
                        href="#reports"
                        onClick={() => handleLinkClick('#reports')}
                        style={navLinkStyle(activeLink === '#reports')}
                        className="block px-4 py-2 md:px-0 md:py-4"
                      >
                        Reports
                      </a>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  style={navLinkStyle(activeLink === '#logout')}
                  className="logout-button"
                >
                  Logout
                </button>
              </li>
              {['Dashboard', 'Users', 'Contacts', 'More', 'Logout'].map((link, index) => (
                <style key={index}>
                  {`
                    .nav-links > li:nth-child(${index + 1}) {
                      opacity: 1;
                      transform: translateX(0);
                      transition: all 0.4s ease ${index * 0.1}s;
                    }
                    .nav-links.active > li:nth-child(${index + 1}) {
                      opacity: 1;
                      transform: translateX(0);
                    }
                    .nav-links > li:nth-child(${index + 1}) > a::before,
                    .nav-links > li:nth-child(${index + 1}) > button::before {
                      ${navLinkBeforeAfterStyle}
                      top: -4px;
                      left: 0;
                      width: 0;
                    }
                    .nav-links > li:nth-child(${index + 1}) > a::after,
                    .nav-links > li:nth-child(${index + 1}) > button::after {
                      ${navLinkBeforeAfterStyle}
                      bottom: -4px;
                      right: 0;
                      width: 0;
                    }
                    .nav-links > li:nth-child(${index + 1}) > a:hover::before,
                    .nav-links > li:nth-child(${index + 1}) > a:hover::after,
                    .nav-links > li:nth-child(${index + 1}) > button:hover::before,
                    .nav-links > li:nth-child(${index + 1}) > button:hover::after {
                      width: 100%;
                      animation: gradient 8s linear infinite;
                    }
                  `}
                </style>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      <div
        className={`overlay fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] opacity-0 invisible transition-all duration-400 ease-linear backdrop-blur-md ${
          isMenuOpen ? 'opacity-100 visible' : ''
        }`}
        onClick={toggleMenu}
      />

      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="fixed top-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 animate-fadeIn"
        >
          <p>{notif.message}</p>
          <p className="text-xs text-gray-400 mt-1">{notif.timestamp}</p>
          <button
            onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
            className="mt-2 px-4 py-1 bg-red-500 text-white rounded"
          >
            Close
          </button>
        </div>
      ))}

      {showContactModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-950 p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-lg font-semibold text-white mb-4">Contact Message Details</h2>
            <p className="text-white"><strong>Name:</strong> {selectedContact.name}</p>
            <p className="text-white"><strong>Email:</strong> {selectedContact.email}</p>
            <p className="text-white"><strong>Message:</strong> {selectedContact.message}</p>
            <p className="text-white"><strong>File:</strong> {selectedContact.file_name || 'No file'}</p>
            <p className="text-white"><strong>Date:</strong> {new Date(selectedContact.created_at).toLocaleString()}</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowContactModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg mr-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-950 p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-lg font-semibold text-white mb-4">Add New User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full rounded-lg bg-slate-900/50 p-3 text-white border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full rounded-lg bg-slate-900/50 p-3 text-white border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full rounded-lg bg-slate-900/50 p-3 text-white border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full rounded-lg bg-slate-900/50 p-3 text-white border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      <section id="dashboard" style={sectionStyle}>
        <div className="bg-effect bg-effect-1" style={bgEffectStyle} />
        <div className="section-content" style={sectionContentStyle}>
          <h1 className="section-title" style={sectionTitleStyle}>
            Dashboard
          </h1>
          <p className="section-description" style={sectionDescriptionStyle}>
            Monitor client activity and usage statistics
          </p>

          {loading ? (
            <div className="flex items-center justify-center mt-10">
              <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mr-4"></div>
              <p className="text-white">Loading dashboard data...</p>
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
          ) : dashboardData ? (
            <div className="flex flex-wrap justify-center gap-6 mt-10">
              <Card
                title="Client Registrations"
                total={dashboardData.totalRegisters}
                percentage="+0%"
                data={dashboardData.registerData}
                chartData={{
                  labels: dashboardData.registerData.map((item) => item.date),
                  data: dashboardData.registerData.map((item) => item.count),
                }}
              />
              <Card
                title="Client Logins"
                total={dashboardData.totalLogins}
                percentage="+0%"
                data={dashboardData.loginData}
                chartData={{
                  labels: dashboardData.loginData.map((item) => item.date),
                  data: dashboardData.loginData.map((item) => item.count),
                }}
              />
              <div className="group relative flex w-80 flex-col rounded-xl bg-slate-950 p-4 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/20">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
                <div className="absolute inset-px rounded-[11px] bg-slate-950" />
                <div className="relative">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Live
                    </span>
                  </div>
                  <div className="mb-4">
                    <ul className="space-y-2 text-sm text-white">
                      {recentActivities.slice(0, 3).map((activity, index) => (
                        <li key={index} className="flex justify-between">
                          <span>{activity.message}</span>
                          <span className="text-slate-400">{activity.timestamp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => navigate('/admin/activity-details')}
                      className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-xs font-medium text-white transition-all duration-300 hover:from-indigo-600 hover:to-purple-600"
                    >
                      View All
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-white text-center mt-10">No dashboard data available.</p>
          )}
        </div>
      </section>

      <section id="users" style={sectionStyle}>
        <div className="bg-effect bg-effect-2" style={{ ...bgEffectStyle, background: 'radial-gradient(circle, rgba(72, 52, 212, 0.1) 0%, rgba(0, 0, 0, 0) 70%)' }} />
        <div className="section-content" style={sectionContentStyle}>
          <h1 className="section-title" style={sectionTitleStyle}>
            Users
          </h1>
          <p className="section-description" style={sectionDescriptionStyle}>
            View and manage all user accounts
          </p>
          <div className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">User List</h2>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-xs font-medium text-white transition-all duration-300 hover:from-indigo-600 hover:to-purple-600"
              >
                Add User
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg shadow-2xl">
              <table className="w-full text-sm text-left text-white">
                <thead className="text-xs uppercase bg-slate-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Name</th>
                    <th scope="col" className="px-6 py-3">Email</th>
                    <th scope="col" className="px-6 py-3">Role</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-900/50">
                      <td className="px-6 py-4">{user.name}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">{user.role}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' :
                          'bg-gray-500/10 text-gray-500'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-500 hover:text-indigo-400"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section id="contacts" style={sectionStyle}>
        <div className="bg-effect bg-effect-1" style={bgEffectStyle} />
        <div className="section-content" style={sectionContentStyle}>
          <h1 className="section-title" style={sectionTitleStyle}>
            Contact Messages
          </h1>
          <p className="section-description" style={sectionDescriptionStyle}>
            View and manage messages from the Contact Us form
          </p>
          <div className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Message List</h2>
              <button
                onClick={() => fetchContactMessages()}
                className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-xs font-medium text-white transition-all duration-300 hover:from-indigo-600 hover:to-purple-600"
              >
                Refresh
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9H0m0 9.414V14h4.582a8.001 8.001 0 0015.356-2H24" />
                </svg>
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg shadow-2xl">
              <table className="w-full text-sm text-left text-white">
                <thead className="text-xs uppercase bg-slate-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Name</th>
                    <th scope="col" className="px-6 py-3">Email</th>
                    <th scope="col" className="px-6 py-3">Message</th>
                    <th scope="col" className="px-6 py-3">File</th>
                    <th scope="col" className="px-6 py-3">Date</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contactMessages.map((msg) => (
                    <tr key={msg.id} className="border-b border-slate-800 hover:bg-slate-900/50">
                      <td className="px-6 py-4">{msg.name}</td>
                      <td className="px-6 py-4">{msg.email}</td>
                      <td className="px-6 py-4">{msg.message}</td>
                      <td className="px-6 py-4">{msg.file_name || 'No file'}</td>
                      <td className="px-6 py-4">{new Date(msg.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleViewContact(msg)}
                          className="text-indigo-500 hover:text-indigo-400"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteContact(msg.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section id="settings" style={sectionStyle}>
        <div className="bg-effect bg-effect-1" style={bgEffectStyle} />
        <div className="section-content" style={sectionContentStyle}>
          <h1 className="section-title" style={sectionTitleStyle}>
            Settings
          </h1>
          <p className="section-description" style={sectionDescriptionStyle}>
            Configure your admin preferences
          </p>
          <div className="mt-10 max-w-2xl mx-auto">
            <div className="group relative flex flex-col rounded-xl bg-slate-950 p-6 shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
              <div className="absolute inset-px rounded-[11px] bg-slate-950" />
              <div className="relative space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Admin Email</label>
                  <input
                    type="email"
                    className="w-full rounded-lg bg-slate-900/50 p-3 text-white border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={adminEmail}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Notification Settings</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="email-notifications"
                      className="h-4 w-4 text-indigo-500 bg-slate-900 border-slate-800 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="email-notifications" className="text-sm text-white">Enable Email Notifications</label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Theme</label>
                  <select
                    className="w-full rounded-lg bg-slate-900/50 p-3 text-white border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:from-indigo-600 hover:to-purple-600"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reports" style={sectionStyle}>
        <div className="bg-effect bg-effect-2" style={{ ...bgEffectStyle, background: 'radial-gradient(circle, rgba(72, 52, 212, 0.1) 0%, rgba(0, 0, 0, 0) 70%)' }} />
        <div className="section-content" style={sectionContentStyle}>
          <h1 className="section-title" style={sectionTitleStyle}>
            Reports
          </h1>
          <p className="section-description" style={sectionDescriptionStyle}>
            Analyze and generate detailed reports
          </p>
          <div className="mt-10 flex flex-wrap gap-6 justify-center">
            <div className="group relative flex w-80 flex-col rounded-xl bg-slate-950 p-4 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/20">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
              <div className="absolute inset-px rounded-[11px] bg-slate-950" />
              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h6m-6 4h6m-6 4h6m-6 4h6" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-white">User Activity Report</h3>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-xs text-slate-400">Generate a report of user activity over the last 30 days.</p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleGenerateReport('userActivity')}
                    className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-xs font-medium text-white transition-all duration-300 hover:from-indigo-600 hover:to-purple-600"
                  >
                    Generate Report
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                {reportData.userActivity && (
                  <div className="mt-4">
                    <h4 className="text-sm text-white">User Activity (Last 30 Days)</h4>
                    <ul className="text-xs text-slate-400">
                      {reportData.userActivity.map((item, index) => (
                        <li key={index}>{item.date}: {item.count} logins</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="group relative flex w-80 flex-col rounded-xl bg-slate-950 p-4 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/20">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
              <div className="absolute inset-px rounded-[11px] bg-slate-950" />
              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-white">Registration Trends</h3>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-xs text-slate-400">Analyze registration trends over the past 6 months.</p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleGenerateReport('registrationTrends')}
                    className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-xs font-medium text-white transition-all duration-300 hover:from-indigo-600 hover:to-purple-600"
                  >
                    Generate Report
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                {reportData.registrationTrends && (
                  <div className="mt-4">
                    <h4 className="text-sm text-white">Registration Trends (Last 6 Months)</h4>
                    <ul className="text-xs text-slate-400">
                      {reportData.registrationTrends.map((item, index) => (
                        <li key={index}>{item.date}: {item.count} registrations</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @media (max-width: 768px) {
            .mobile-nav-toggle {
              display: block;
            }
            .nav-links {
              display: none;
            }
            .nav-links.active {
              display: flex;
              right: 0;
              flex-direction: column;
              align-items: center;
            }
            .nav-links li {
              width: 100%;
              text-align: center;
            }
            .nav-links li ul {
              position: static;
              width: 100%;
              background: transparent;
              box-shadow: none;
            }
            .nav-links li ul li {
              border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            .section-title {
              font-size: 12vw;
            }
            .section-description {
              font-size: 1rem;
            }
            .logout-button {
              display: block !important;
              width: 100%;
              padding: 1rem 0 !important;
              font-size: 1.2rem !important;
            }
          }

          @media (min-width: 769px) {
            .nav-links {
              display: flex !important;
              opacity: 1 !important;
              flex-wrap: nowrap;
              overflow-x: auto;
              max-width: 100%;
            }
            .nav-links li {
              display: block;
              flex: 0 0 auto;
            }
            .logout-button {
              display: block !important;
              font-size: 1.1rem !important;
            }
          }

          body {
            overflow-x: hidden;
          }

          .nav-links {
            overflow-x: auto;
            scroll-behavior: smooth;
            white-space: nowrap;
            padding-bottom: 5px;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .nav-links::-webkit-scrollbar {
            display: none;
          }

          .nav-links a:hover,
          .nav-links button:hover {
            transform: scale(1.05);
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
          }

          .logout-button {
            border: 2px solid rgba(255, 51, 102, 0.7);
            border-radius: 8px;
            padding: 0.5rem 1rem !important;
            transition: all 0.3s ease;
            color: #ff3366 !important;
          }

          .logout-button:hover {
            background: rgba(255, 51, 102, 0.3);
            color: #ffffff !important;
          }

          .light {
            background-color: #f0f0f0;
            color: #333;
          }

          .light .bg-slate-950 {
            background-color: #ffffff;
            color: #333;
          }

          .light .text-white {
            color: #333;
          }

          .light .bg-slate-900\\/50 {
            background-color: #e0e0e0;
          }

          .light .text-slate-400 {
            color: #666;
          }
        `}
      </style>
    </div>
  );
};

export default Home;