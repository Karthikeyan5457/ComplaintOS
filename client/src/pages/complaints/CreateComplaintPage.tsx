import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintsApi, categoriesApi, departmentsApi } from '../../api/client';
import Header from '../../components/layout/Header';
import { Brain, Loader2, CheckCircle, Send, MapPin, Phone, FileText } from 'lucide-react';
import type { Category, Department, Complaint } from '../../types';

type SubmitStage = 'form' | 'analyzing' | 'done';

export default function CreateComplaintPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stage, setStage] = useState<SubmitStage>('form');
  const [createdComplaint, setCreatedComplaint] = useState<Complaint | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', location: '', contactInfo: '',
    categoryId: '', departmentId: '', priority: '',
  });

  useEffect(() => {
    categoriesApi.findAll().then(r => setCategories(r.data.filter((c: Category) => c.isActive)));
    departmentsApi.findAll().then(r => setDepartments(r.data.filter((d: Department) => d.isActive)));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStage('analyzing');

    try {
      const payload: any = { title: form.title, description: form.description };
      if (form.location) payload.location = form.location;
      if (form.contactInfo) payload.contactInfo = form.contactInfo;
      if (form.categoryId) payload.categoryId = form.categoryId;
      if (form.departmentId) payload.departmentId = form.departmentId;
      if (form.priority) payload.priority = form.priority;

      const { data } = await complaintsApi.create(payload);
      setCreatedComplaint(data);

      // Poll for AI analysis completion
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const { data: updated } = await complaintsApi.findById(data.id);
          if (updated.status !== 'SUBMITTED' && updated.status !== 'AI_ANALYSIS') {
            setCreatedComplaint(updated);
            setStage('done');
            clearInterval(poll);
          } else if (attempts > 15) {
            setCreatedComplaint(updated);
            setStage('done');
            clearInterval(poll);
          }
        } catch {
          clearInterval(poll);
          setStage('done');
        }
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit complaint');
      setStage('form');
    }
  };

  // AI Analyzing screen
  if (stage === 'analyzing') {
    return (
      <div>
        <Header title="Submitting Complaint" />
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center animate-fadeIn">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30 animate-pulse-soft">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">AI is analyzing your complaint...</h2>
            <p className="text-surface-400 mb-6">Categorizing, detecting priority, and routing to the right department</p>
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
              <span className="text-sm text-primary-400">Processing</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Done screen
  if (stage === 'done' && createdComplaint) {
    return (
      <div>
        <Header title="Complaint Submitted" />
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md animate-scaleIn">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Complaint Submitted!</h2>
            <p className="text-surface-400 mb-1">Tracking ID: <span className="text-white font-mono">{createdComplaint.trackingId}</span></p>

            {/* AI results */}
            {createdComplaint.aiCategory && (
              <div className="mt-6 glass-card p-5 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold text-white">AI Classification Result</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Category', value: createdComplaint.aiCategory },
                    { label: 'Priority', value: createdComplaint.aiPriority },
                    { label: 'Department', value: createdComplaint.aiDepartment },
                    { label: 'Confidence', value: createdComplaint.aiConfidence ? `${Math.round(createdComplaint.aiConfidence * 100)}%` : 'N/A' },
                  ].map(item => (
                    <div key={item.label} className="p-2.5 rounded-lg bg-surface-800/50">
                      <p className="text-[10px] text-surface-500 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm text-white font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
                {createdComplaint.aiSummary && (
                  <div className="mt-3 p-2.5 rounded-lg bg-surface-800/50">
                    <p className="text-[10px] text-surface-500 uppercase tracking-wider">Summary</p>
                    <p className="text-sm text-surface-300 mt-0.5">{createdComplaint.aiSummary}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => navigate(`/complaints/${createdComplaint.id}`)}
                className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 text-sm font-medium transition-colors"
              >
                View Complaint
              </button>
              <button
                onClick={() => { setStage('form'); setForm({ title: '', description: '', location: '', contactInfo: '', categoryId: '', departmentId: '', priority: '' }); setCreatedComplaint(null); }}
                className="flex-1 py-2.5 bg-surface-800 text-white rounded-xl hover:bg-surface-700 text-sm font-medium transition-colors"
              >
                Submit Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form
  return (
    <div>
      <Header title="Submit New Complaint" />
      <div className="p-6 max-w-3xl mx-auto">
        <div className="glass-card p-6 animate-slideUp">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">New Complaint</h2>
              <p className="text-xs text-surface-400">Our AI will automatically categorize and route your complaint</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Title *</label>
              <input
                required minLength={5} maxLength={200}
                placeholder="Brief title describing the issue"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-700 rounded-xl text-sm text-white placeholder-surface-500 focus:border-primary-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Description *</label>
              <textarea
                required minLength={20} maxLength={5000}
                rows={5}
                placeholder="Describe the issue in detail. The more information you provide, the better AI can classify it."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 bg-surface-800/50 border border-surface-700 rounded-xl text-sm text-white placeholder-surface-500 focus:border-primary-500 transition-colors resize-none"
              />
              <p className="text-xs text-surface-600 mt-1">{form.description.length}/5000</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">
                  <MapPin className="w-3.5 h-3.5 inline mr-1" /> Location
                </label>
                <input
                  placeholder="Building, floor, room number"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-700 rounded-xl text-sm text-white placeholder-surface-500 focus:border-primary-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">
                  <Phone className="w-3.5 h-3.5 inline mr-1" /> Contact Info
                </label>
                <input
                  placeholder="Phone or alternate email"
                  value={form.contactInfo}
                  onChange={e => setForm({ ...form, contactInfo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-700 rounded-xl text-sm text-white placeholder-surface-500 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Category (optional)</label>
                <select
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface-800/50 border border-surface-700 rounded-xl text-sm text-white focus:border-primary-500 transition-colors"
                >
                  <option value="">AI will detect</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Priority (optional)</label>
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface-800/50 border border-surface-700 rounded-xl text-sm text-white focus:border-primary-500 transition-colors"
                >
                  <option value="">AI will detect</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Department (optional)</label>
                <select
                  value={form.departmentId}
                  onChange={e => setForm({ ...form, departmentId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface-800/50 border border-surface-700 rounded-xl text-sm text-white focus:border-primary-500 transition-colors"
                >
                  <option value="">AI will route</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-xl hover:from-primary-500 hover:to-primary-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
              >
                <Send className="w-4 h-4" /> Submit Complaint
              </button>
              <p className="text-center text-xs text-surface-500 mt-2">
                Our AI will analyze, categorize, and route your complaint automatically
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
