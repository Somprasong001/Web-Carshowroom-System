import React from 'react';

interface StatCardProps {
    title: string;
    value: number | string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
    );
};

export default StatCard;