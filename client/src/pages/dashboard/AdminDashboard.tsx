import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsApi } from '../../api/client';
import Header from '../../components/layout/Header';
import StatsCard from '../../components/ui/StatsCard';
import {
  FileText, Clock, CheckCircle, AlertTriangle, TrendingUp,
  XCircle, Zap, BarChart3, Target,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, Legend,
} from 'recharts';
import type { DashboardStats, TrendData } from '../../types';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#f97316'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.dashboard().then(r => setStats(r.data)),
      analyticsApi.trends(30).then(r => setTrends(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div>
        <Header title="Admin Dashboard" />
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Admin Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="cursor-pointer" onClick={() => navigate('/complaints')}>
            <StatsCard title="Total Complaints" value={stats.total} icon={FileText} color="from-primary-500 to-primary-700" delay={0} />
          </div>
          <div className="cursor-pointer" onClick={() => navigate('/complaints?status=SUBMITTED')}>
            <StatsCard title="New / Pending" value={stats.new} icon={Clock} color="from-blue-500 to-blue-700" delay={50} />
          </div>
          <div className="cursor-pointer" onClick={() => navigate('/complaints?status=IN_PROGRESS')}>
            <StatsCard title="In Progress" value={stats.inProgress} icon={TrendingUp} color="from-amber-500 to-amber-700" delay={100} />
          </div>
          <div className="cursor-pointer" onClick={() => navigate('/complaints?status=RESOLVED')}>
            <StatsCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="from-emerald-500 to-emerald-700" delay={150} />
          </div>
          <div className="cursor-pointer" onClick={() => navigate('/complaints')}>
            <StatsCard title="Overdue" value={stats.overdue} icon={AlertTriangle} color="from-red-500 to-red-700" delay={200} />
          </div>
          <div className="cursor-pointer" onClick={() => navigate('/complaints?priority=CRITICAL')}>
            <StatsCard title="Critical" value={stats.critical} icon={Zap} color="from-rose-500 to-rose-700" delay={250} />
          </div>
          <div className="cursor-pointer" onClick={() => navigate('/admin/sla')}>
            <StatsCard title="SLA Compliance" value={`${stats.slaCompliance}%`} icon={Target} color="from-cyan-500 to-cyan-700" delay={300} />
          </div>
          <div className="cursor-pointer" onClick={() => navigate('/complaints')}>
            <StatsCard title="Avg Resolution" value={`${stats.avgResolutionHours}h`} icon={BarChart3} color="from-violet-500 to-violet-700" delay={350} />
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend chart */}
          <div className="glass-card p-6 animate-slideUp" style={{ animationDelay: '200ms' }}>
            <h3 className="text-sm font-semibold text-white mb-4">Complaint Trends (30 Days)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(v: string) => v.slice(5)} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#colorCount)" name="Submitted" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="url(#colorResolved)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category pie */}
          <div className="glass-card p-6 animate-slideUp cursor-pointer" style={{ animationDelay: '250ms' }} onClick={() => navigate('/admin/categories')}>
            <h3 className="text-sm font-semibold text-white mb-4">By Category</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.byCategory}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  label={({ category, count, cx, cy, midAngle, outerRadius }: any) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 18;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text x={x} y={y} fill="#94a3b8" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11}>
                        {category}: {count}
                      </text>
                    );
                  }}
                  labelLine={{ stroke: '#475569', strokeWidth: 1 }}
                  fontSize={11}
                >
                  {stats.byCategory.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Priority bar */}
          <div className="glass-card p-6 animate-slideUp cursor-pointer" style={{ animationDelay: '300ms' }} onClick={() => navigate('/complaints')}>
            <h3 className="text-sm font-semibold text-white mb-4">By Priority</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.byPriority} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="priority" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stats.byPriority.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.priority === 'CRITICAL' ? '#ef4444' :
                        entry.priority === 'HIGH' ? '#f97316' :
                        entry.priority === 'MEDIUM' ? '#f59e0b' : '#10b981'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department bar */}
          <div className="glass-card p-6 animate-slideUp cursor-pointer" style={{ animationDelay: '350ms' }} onClick={() => navigate('/admin/departments')}>
            <h3 className="text-sm font-semibold text-white mb-4">By Department</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.byDepartment} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="department" type="category" stroke="#64748b" fontSize={11} width={100} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
