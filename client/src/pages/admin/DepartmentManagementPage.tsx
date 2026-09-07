import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { departmentsApi } from '../../api/client';
import Header from '../../components/layout/Header';
import Modal from '../../components/ui/Modal';
import { Building2, Plus, Edit, Trash2, Users, FileText, ExternalLink } from 'lucide-react';
import type { Department } from '../../types';

export default function DepartmentManagementPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const load = () => {
    setLoading(true);
    departmentsApi.findAll().then(r => setDepartments(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSave = async () => {
    if (editing) {
      await departmentsApi.update(editing.id, form);
    } else {
      await departmentsApi.create(form);
    }
    setShowModal(false);
    setEditing(null);
    setForm({ name: '', description: '' });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this department?')) return;
    await departmentsApi.delete(id);
    load();
  };

  return (
    <div>
      <Header title="Department Management" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-surface-400">{departments.length} departments</p>
          <button
            onClick={() => { setEditing(null); setForm({ name: '', description: '' }); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-500 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Department
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [...Array(6)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)
          ) : departments.map((d, i) => (
            <div key={d.id} className="glass-card p-5 animate-slideUp cursor-pointer hover:border-cyan-500/30 transition-all duration-300" style={{ animationDelay: `${i * 50}ms` }} onClick={() => navigate(`/complaints?departmentId=${d.id}`)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 flex items-center gap-1.5">{d.name} <ExternalLink className="w-3 h-3 text-surface-600" /></h3>
                    <span className={`text-[10px] ${d.isActive ? 'text-green-400' : 'text-red-400'}`}>
                      {d.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => { setEditing(d); setForm({ name: d.name, description: d.description || '' }); setShowModal(true); }}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(d.id)}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {d.description && <p className="text-xs text-surface-400 mb-3">{d.description}</p>}
              <div className="flex gap-4 text-xs text-surface-500">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {d._count?.staff || 0} staff</span>
                <span className="flex items-center gap-1 text-cyan-400/70"><FileText className="w-3.5 h-3.5" /> {d._count?.complaints || 0} complaints</span>
              </div>
              {d.head && <p className="text-xs text-surface-500 mt-2">Head: {d.head.name}</p>}
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Department' : 'New Department'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-xl text-sm text-white" placeholder="Department name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full p-3 bg-surface-800 border border-surface-700 rounded-xl text-sm text-white resize-none" placeholder="Description" />
          </div>
          <button onClick={handleSave} disabled={!form.name} className="w-full py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-500 disabled:opacity-50 text-sm font-medium transition-colors">
            {editing ? 'Update' : 'Create'} Department
          </button>
        </div>
      </Modal>
    </div>
  );
}
