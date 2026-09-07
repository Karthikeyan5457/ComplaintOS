import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { complaintsApi, departmentsApi, categoriesApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/layout/Header';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badges';
import { formatRelativeTime, getSlaStatus } from '../../utils/helpers';
import { Search, Filter, ChevronLeft, ChevronRight, PlusCircle, ArrowRight, Clock } from 'lucide-react';
import type { Complaint, Department, Category, PaginatedResponse } from '../../types';

export default function ComplaintListPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PaginatedResponse<Complaint> | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const page = Number(searchParams.get('page') || '1');
  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const departmentId = searchParams.get('departmentId') || '';
  const categoryId = searchParams.get('categoryId') || '';

  useEffect(() => {
    Promise.all([
      departmentsApi.findAll().then(r => setDepartments(r.data)),
      categoriesApi.findAll().then(r => setCategories(r.data)),
    ]).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: any = { page, limit: 12 };
    if (status) params.status = status;
    if (priority) params.priority = priority;
    if (departmentId) params.departmentId = departmentId;
    if (categoryId) params.categoryId = categoryId;
    if (search) params.search = search;

    complaintsApi.findAll(params)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [page, status, priority, departmentId, categoryId, search]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div>
      <Header title={user?.role === 'USER' ? 'My Complaints' : 'All Complaints'} />
      <div className="p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center flex-1">
            {/* Search */}
            <div className="relative min-w-[240px] flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && updateFilter('search', search)}
                className="w-full pl-10 pr-4 py-2 bg-surface-900 border border-surface-700 rounded-xl text-sm text-white placeholder-surface-500 focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Filters */}
            <select
              value={status}
              onChange={e => updateFilter('status', e.target.value)}
              className="px-3 py-2 bg-surface-900 border border-surface-700 rounded-xl text-sm text-white focus:border-primary-500 transition-colors"
            >
              <option value="">All Statuses</option>
              {['SUBMITTED','AI_ANALYSIS','CLASSIFIED','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED','REOPENED'].map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>

            <select
              value={priority}
              onChange={e => updateFilter('priority', e.target.value)}
              className="px-3 py-2 bg-surface-900 border border-surface-700 rounded-xl text-sm text-white focus:border-primary-500 transition-colors"
            >
              <option value="">All Priorities</option>
              {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {user?.role !== 'USER' && (
              <select
                value={departmentId}
                onChange={e => updateFilter('departmentId', e.target.value)}
                className="px-3 py-2 bg-surface-900 border border-surface-700 rounded-xl text-sm text-white focus:border-primary-500 transition-colors"
              >
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            )}
          </div>

          <Link
            to="/complaints/new"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-medium rounded-xl hover:from-primary-500 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/20"
          >
            <PlusCircle className="w-4 h-4" /> New Complaint
          </Link>
        </div>

        {/* Complaints list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
          </div>
        ) : !data || data.complaints.length === 0 ? (
          <div className="text-center py-16">
            <Filter className="w-12 h-12 text-surface-600 mx-auto mb-3" />
            <p className="text-surface-400 text-lg font-medium">No complaints found</p>
            <p className="text-surface-500 text-sm mt-1">Try adjusting your filters or submit a new complaint</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.complaints.map((c, i) => {
              const sla = getSlaStatus(c.slaDeadline);
              return (
                <Link
                  key={c.id}
                  to={`/complaints/${c.id}`}
                  className="block glass-card p-4 hover:border-primary-500/20 transition-all duration-200 group animate-slideUp"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-[10px] font-mono text-surface-500 bg-surface-800/50 px-2 py-0.5 rounded">{c.trackingId}</span>
                        <StatusBadge status={c.status} />
                        <PriorityBadge priority={c.priority} />
                        {sla.isOverdue && (
                          <span className="badge border bg-red-500/20 text-red-400 border-red-500/30">
                            <Clock className="w-3 h-3" /> OVERDUE
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-primary-400 transition-colors truncate">{c.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-surface-500">
                        <span>{c.category?.name || 'Uncategorized'}</span>
                        <span>•</span>
                        <span>{c.department?.name || 'Unassigned'}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(c.createdAt)}</span>
                        {c.assignedTo && (
                          <>
                            <span>•</span>
                            <span>Assigned to {c.assignedTo.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-surface-600 group-hover:text-primary-400 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => updateFilter('page', String(page - 1))}
              disabled={page <= 1}
              className="p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-surface-400 px-4">
              Page {page} of {data.pagination.totalPages}
            </span>
            <button
              onClick={() => updateFilter('page', String(page + 1))}
              disabled={page >= data.pagination.totalPages}
              className="p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
