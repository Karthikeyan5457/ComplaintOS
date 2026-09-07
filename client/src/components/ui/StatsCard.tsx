import type { ComponentType } from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ComponentType<{ className?: string }>;
  trend?: string;
  color?: string;
  delay?: number;
}

export default function StatsCard({ title, value, icon: Icon, trend, color = 'from-primary-500 to-primary-700', delay = 0 }: StatsCardProps) {
  return (
    <div
      className="glass-card p-5 animate-slideUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white mt-1.5">{value}</p>
          {trend && <p className="text-xs text-surface-400 mt-1">{trend}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}
