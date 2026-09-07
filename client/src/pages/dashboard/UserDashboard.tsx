import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../../api/client';
import Header from '../../components/layout/Header';
import StatsCard from '../../components/ui/StatsCard';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badges';
import { FileText, Clock, Loader, CheckCircle, PlusCircle, ArrowRight } from 'lucide-react';
import { formatRelativeTime } from '../../utils/helpers';
import type { UserStats } from '../../types';

export default function UserDashboard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.userStats().then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div>
        <Header title="My Dashboard" />
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="My Dashboard" />
      <div className="p-6 space-y-6">
        {/* CTA */}
        <Link
          to="/complaints/new"
          className="block glass-card p-6 group hover:border-primary-500/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300">
                <PlusCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Submit a New Complaint</h2>
                <p className="text-sm text-surface-400">Our AI will automatically categorize and route your complaint</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-surface-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Complaints" value={stats.total} icon={FileText} color="from-primary-500 to-primary-700" delay={0} />
          <StatsCard title="Open" value={stats.open} icon={Clock} color="from-blue-500 to-blue-700" delay={50} />
          <StatsCard title="In Progress" value={stats.inProgress} icon={Loader} color="from-amber-500 to-amber-700" delay={100} />
          <StatsCard title="Resolved" value={stats.resolved + stats.closed} icon={CheckCircle} color="from-emerald-500 to-emerald-700" delay={150} />
        </div>

        {/* Recent complaints */}
        <div className="glass-card p-6 animate-slideUp" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Complaints</h3>
            <Link to="/complaints" className="text-xs text-primary-400 hover:text-primary-300">View All →</Link>
          </div>

          {stats.recentComplaints.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-surface-600 mx-auto mb-3" />
              <p className="text-surface-400">No complaints yet</p>
              <Link to="/complaints/new" className="text-sm text-primary-400 hover:text-primary-300 mt-2 inline-block">
                Submit your first complaint →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentComplaints.map(c => (
                <Link
                  key={c.id}
                  to={`/complaints/${c.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-800/30 hover:bg-surface-800/60 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-surface-500">{c.trackingId}</span>
                      <StatusBadge status={c.status} />
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <p className="text-sm text-white font-medium truncate">{c.title}</p>
                    <p className="text-xs text-surface-500 mt-0.5">
                      {c.category?.name || 'Uncategorized'} • {formatRelativeTime(c.createdAt)}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-surface-600 group-hover:text-primary-400 transition-colors flex-shrink-0 ml-3" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
