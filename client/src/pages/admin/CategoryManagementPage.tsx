import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoriesApi } from '../../api/client';
import Header from '../../components/layout/Header';
import Modal from '../../components/ui/Modal';
import { Tags, Plus, Edit, Trash2, FileText, ExternalLink } from 'lucide-react';
import type { Category } from '../../types';

export default function CategoryManagementPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '' });

  const load = () => {
    setLoading(true);
    categoriesApi.findAll().then(r => setCategories(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSave = async () => {
    if (editing) {
      await categoriesApi.update(editing.id, form);
    } else {
      await categoriesApi.create(form);
    }
    setShowModal(false);
    setEditing(null);
    setForm({ name: '', description: '', icon: '' });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this category?')) return;
    await categoriesApi.delete(id);
    load();
  };

  return (
    <div>
      <Header title="Category Management" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-surface-400">{categories.length} categories</p>
          <button
            onClick={() => { setEditing(null); setForm({ name: '', description: '', icon: '' }); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-500 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [...Array(6)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)
          ) : categories.map((c, i) => (
            <div key={c.id} className="glass-card p-5 animate-slideUp cursor-pointer hover:border-indigo-500/30 transition-all duration-300" style={{ animationDelay: `${i * 40}ms` }} onClick={() => navigate(`/complaints?categoryId=${c.id}`)}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <Tags className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">{c.name} <ExternalLink className="w-3 h-3 text-surface-600" /></h3>
                    <span className={`text-[10px] ${c.isActive ? 'text-green-400' : 'text-red-400'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => { setEditing(c); setForm({ name: c.name, description: c.description || '', icon: c.icon || '' }); setShowModal(true); }}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(c.id)}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {c.description && <p className="text-xs text-surface-400 mb-2">{c.description}</p>}
              <div className="flex items-center gap-1 text-xs text-indigo-400/70">
                <FileText className="w-3.5 h-3.5" /> {c._count?.complaints || 0} complaints
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Category' : 'New Category'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-xl text-sm text-white" placeholder="Category name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full p-3 bg-surface-800 border border-surface-700 rounded-xl text-sm text-white resize-none" placeholder="Description" />
          </div>
          <button onClick={handleSave} disabled={!form.name} className="w-full py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-500 disabled:opacity-50 text-sm font-medium transition-colors">
            {editing ? 'Update' : 'Create'} Category
          </button>
        </div>
      </Modal>
    </div>
  );
}
