import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Activity {
  message: string;
  timestamp: string;
}

interface LoginStats {
  date: string;
  count: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to create headers
const getHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

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

        const token = getAuthToken();
        if (!token) {
          navigate('/admin/login');
          return;
        }

        // Fetch recent activity
        const activityResponse = await fetch(`${API_URL}/auth/recent-activity`, {
          method: 'GET',
          headers: getHeaders(),
          mode: 'cors',
          credentials: 'include',
        });

        if (!activityResponse.ok) {
          throw new Error('Failed to fetch activities');
        }

        const activitiesData = await activityResponse.json();

        // Fetch user activity stats
        const statsResponse = await fetch(`${API_URL}/reports/user-activity`, {
          method: 'GET',
          headers: getHeaders(),
          mode: 'cors',
          credentials: 'include',
        });

        if (!statsResponse.ok) {
          throw new Error('Failed to fetch stats');
        }

        const statsData = await statsResponse.json();

        // Process activities
        const processedActivities = activitiesData.map((activity: any) => ({
          message: activity.message || activity.action || 'Unknown activity',
          timestamp: new Date(activity.timestamp || activity.created_at).toLocaleString('th-TH'),
        }));

        setActivities(processedActivities);
        setLoginStats(statsData || []);
      } catch (error: any) {
        console.error('Error fetching activity details:', error);
        setError(error.message || 'ไม่สามารถโหลดข้อมูลได้');
        
        // If unauthorized, redirect to login
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
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
          <h1
            className="text-5xl font-bold uppercase text-center flex-1"
            style={{
              background: 'linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient 8s linear infinite',
              backgroundSize: '300%',
            }}
          >
            Activity Details
          </h1>
          <button
            onClick={() => navigate('/admin/home')}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:from-indigo-600 hover:to-purple-600 hover:scale-105"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        <p className="text-center text-lg opacity-80 mb-10">
          Detailed view of recent user activities and login statistics
        </p>

        {loading ? (
          <div className="flex items-center justify-center mt-10">
            <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mr-4"></div>
            <p className="text-lg">Loading activity details...</p>
          </div>
        ) : error ? (
          <div className="text-center mt-10">
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 max-w-md mx-auto">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all hover:scale-105"
              >
                ลองโหลดใหม่
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-10 space-y-8">
            {/* Recent Activities Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                All Recent Activities
              </h2>
              <div className="overflow-x-auto rounded-lg shadow-2xl border border-slate-800">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase bg-gradient-to-r from-slate-900 to-slate-800">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left">Activity</th>
                      <th scope="col" className="px-6 py-4 text-left">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.length > 0 ? (
                      activities.map((activity, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors"
                        >
                          <td className="px-6 py-4">{activity.message}</td>
                          <td className="px-6 py-4 text-gray-400">{activity.timestamp}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                          ไม่มีข้อมูลกิจกรรม
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Login Statistics Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Login Statistics (Last 30 Days)
              </h2>
              <div className="overflow-x-auto rounded-lg shadow-2xl border border-slate-800">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase bg-gradient-to-r from-slate-900 to-slate-800">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left">Date</th>
                      <th scope="col" className="px-6 py-4 text-left">Login Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginStats.length > 0 ? (
                      loginStats.map((stat, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors"
                        >
                          <td className="px-6 py-4">{stat.date}</td>
                          <td className="px-6 py-4">
                            <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full font-semibold">
                              {stat.count}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                          ไม่มีข้อมูลสถิติการเข้าสู่ระบบ
                        </td>
                      </tr>
                    )}
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