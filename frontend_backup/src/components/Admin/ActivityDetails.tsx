import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Activity {
  message: string;
  timestamp: string;
}

interface LoginStats {
  date: string;
  count: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const ActivityDetails: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loginStats, setLoginStats] = useState<LoginStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('ไม่พบโทเค็นการยืนยันตัวตน');
        }

        const [activityResponse, statsResponse] = await Promise.all([
          apiClient.get('/api/auth/recent-activity', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiClient.get('/api/reports/user-activity', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const activitiesData = activityResponse.data.map((activity: any) => ({
          message: activity.message,
          timestamp: new Date(activity.timestamp).toLocaleString(),
        }));
        setActivities(activitiesData);
        setLoginStats(statsResponse.data);
      } catch (error: any) {
        console.error('Error fetching activity details:', error);
        setError(error.response?.data?.error || 'ไม่สามารถโหลดข้อมูลได้');
        if (error.response?.status === 401) {
          navigate('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <div className="bg-[#0a0a0a] min-h-screen font-sans w-full text-white">
      <div className="max-w-[1400px] mx-auto px-5 py-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-5xl font-bold uppercase text-center w-full"
              style={{
                background: 'linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradient 8s linear infinite',
                backgroundSize: '300%',
              }}>
            Activity Details
          </h1>
          <button
            onClick={() => navigate('/admin/home#dashboard')}
            className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-xs font-medium text-white transition-all duration-300 hover:from-indigo-600 hover:to-purple-600"
          >
            Back to Dashboard
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <p className="text-center text-lg opacity-80 mb-10">
          Detailed view of recent user activities and login statistics
        </p>

        {loading ? (
          <div className="flex items-center justify-center mt-10">
            <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mr-4"></div>
            <p>Loading activity details...</p>
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
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">All Recent Activities</h2>
              <div className="overflow-x-auto rounded-lg shadow-2xl">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-slate-900/50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Activity</th>
                      <th scope="col" className="px-6 py-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity, index) => (
                      <tr key={index} className="border-b border-slate-800 hover:bg-slate-900/50">
                        <td className="px-6 py-4">{activity.message}</td>
                        <td className="px-6 py-4">{activity.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Login Statistics (Last 30 Days)</h2>
              <div className="overflow-x-auto rounded-lg shadow-2xl">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-slate-900/50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Date</th>
                      <th scope="col" className="px-6 py-3">Login Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginStats.map((stat, index) => (
                      <tr key={index} className="border-b border-slate-800 hover:bg-slate-900/50">
                        <td className="px-6 py-4">{stat.date}</td>
                        <td className="px-6 py-4">{stat.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

export default ActivityDetails;