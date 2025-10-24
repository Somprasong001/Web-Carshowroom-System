import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50 p-6 transition-all hover:scale-105 hover:border-slate-700">
      {/* Background Gradient */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full blur-2xl -mr-8 -mt-8`}
      ></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${color} bg-opacity-20`}>
            <div className="text-white">{icon}</div>
          </div>
        </div>

        <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>

      {/* Animated Border Effect */}
      <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${color} opacity-0 hover:opacity-20 transition-opacity`}></div>
    </div>
  );
};

export default StatCard;