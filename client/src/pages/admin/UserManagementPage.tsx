import { useState, useEffect } from 'react';
import { usersApi, departmentsApi } from '../../api/client';
import Header from '../../components/layout/Header';
import Modal from '../../components/ui/Modal';
import { Users, Search, Edit, Shield, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import type { User, Department } from '../../types';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ role: '', departmentId: '', isActive: true });

  useEffect(() => {
    departmentsApi.findAll().then(r => setDepartments(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    usersApi.findAll({ page, limit: 15, search, role: roleFilter || undefined })
      .then(r => { setUsers(r.data.users); setTotal(r.data.pagination.total); })
      .finally(() => setLoading(false));
  }, [page, search, roleFilter]);

  const handleSave = async () => {
    if (!editUser) return;
    await usersApi.update(editUser.id, {
      role: editForm.role,
      departmentId: editForm.departmentId || null,
      isActive: editForm.isActive,
    });
    setEditUser(null);
    usersApi.findAll({ page, limit: 15, search, role: roleFilter || undefined })
      .then(r => { setUsers(r.data.users); setTotal(r.data.pagination.total); });
  };

  const handleDelete = async (u: User) => {
    if (u.role === 'ADMIN') return alert('Cannot delete an admin account');
    if (!confirm(`Are you sure you want to delete "${u.name}" (${u.email})? This action cannot be undone.`)) return;
    await usersApi.update(u.id, { isActive: false });
    usersApi.findAll({ page, limit: 15, search, role: roleFilter || undefined })
      .then(r => { setUsers(r.data.users); setTotal(r.data.pagination.total); });
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-purple-500/20 text-purple-400',
    STAFF: 'bg-cyan-500/20 text-cyan-400',
    USER: 'bg-green-500/20 text-green-400',
  };

  return (
    <div>
      <Header title="User Management" />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              placeholder="Search users..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-surface-900 border border-surface-700 rounded-xl text-sm text-white placeholder-surface-500 focus:border-primary-500 transition-colors"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-surface-900 border border-surface-700 rounded-xl text-sm text-white"
          >
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-800">
                  <th className="text-left px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider">Department</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider">Joined</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="skeleton h-8 rounded" /></td></tr>
                  ))
                ) : users.map(u => (
                  <tr key={u.id} className="border-b border-surface-800/50 hover:bg-surface-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-600/30 flex items-center justify-center text-xs font-bold text-primary-400">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{u.name}</p>
                          <p className="text-xs text-surface-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${roleColors[u.role] || ''}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-surface-400">{u.department?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-surface-500 text-xs">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditUser(u); setEditForm({ role: u.role, departmentId: u.departmentId || '', isActive: u.isActive }); }}
                          className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm text-surface-500">
          <span>{total} user(s)</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1 rounded hover:bg-surface-800 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            <span>Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={users.length < 15} className="p-1 rounded hover:bg-surface-800 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title={`Edit ${editUser?.name || ''}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Role</label>
            <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-xl text-sm text-white">
              <option value="USER">User</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Department</label>
            <select value={editForm.departmentId} onChange={e => setEditForm({ ...editForm, departmentId: e.target.value })} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-xl text-sm text-white">
              <option value="">None</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-surface-300 cursor-pointer">
            <input type="checkbox" checked={editForm.isActive} onChange={e => setEditForm({ ...editForm, isActive: e.target.checked })} />
            Active
          </label>
          <button onClick={handleSave} className="w-full py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-500 text-sm font-medium transition-colors">
            Save Changes
          </button>
        </div>
      </Modal>
    </div>
  );
}
