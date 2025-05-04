import React, { useState, useEffect } from 'react';
import StatCard from './StatCard'; // Import จากโฟลเดอร์เดียวกัน

interface DashboardStats {
    totalCars: number;
    pendingBookings: number;
    totalUsers: number;
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalCars: 0,
        pendingBookings: 0,
        totalUsers: 0
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Fetch stats from API when component mounts
    useEffect(() => {
        const fetchDashboardStats = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/admin/stats');
                if (!response.ok) throw new Error('Failed to fetch stats');
                const data: DashboardStats = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                // Mock data as fallback
                setStats({
                    totalCars: 50,
                    pendingBookings: 12,
                    totalUsers: 245
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 text-center">
                <span className="text-gray-600">Loading...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                    title="Total Cars" 
                    value={stats.totalCars} 
                    color="text-blue-600" 
                />
                <StatCard 
                    title="Pending Bookings" 
                    value={stats.pendingBookings} 
                    color="text-yellow-600" 
                />
                <StatCard 
                    title="Total Users" 
                    value={stats.totalUsers} 
                    color="text-green-600" 
                />
            </div>
        </div>
    );
};

export default Dashboard;