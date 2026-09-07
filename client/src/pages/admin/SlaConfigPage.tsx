import { useState, useEffect } from 'react';
import { slaApi } from '../../api/client';
import Header from '../../components/layout/Header';
import { Clock, Save, Loader2 } from 'lucide-react';
import type { SlaRule } from '../../types';

const priorityInfo: Record<string, { color: string; label: string }> = {
  LOW: { color: 'from-green-500 to-green-700', label: 'Low Priority' },
  MEDIUM: { color: 'from-yellow-500 to-yellow-700', label: 'Medium Priority' },
  HIGH: { color: 'from-orange-500 to-orange-700', label: 'High Priority' },
  CRITICAL: { color: 'from-red-500 to-red-700', label: 'Critical Priority' },
};

export default function SlaConfigPage() {
  const [rules, setRules] = useState<SlaRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, { responseHours: number; resolutionHours: number }>>({});

  useEffect(() => {
    slaApi.findAll().then(r => {
      setRules(r.data);
      const vals: any = {};
      r.data.forEach((rule: SlaRule) => {
        vals[rule.id] = { responseHours: rule.responseHours, resolutionHours: rule.resolutionHours };
      });
      setEditValues(vals);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (rule: SlaRule) => {
    setSaving(rule.id);
    try {
      await slaApi.update(rule.id, editValues[rule.id]);
      const { data } = await slaApi.findAll();
      setRules(data);
    } catch {}
    setSaving(null);
  };

  return (
    <div>
      <Header title="SLA Configuration" />
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">SLA Rules</h2>
                <p className="text-xs text-surface-400">Configure response and resolution time limits per priority level</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)
            ) : rules.map((rule, i) => {
              const info = priorityInfo[rule.priority] || priorityInfo.MEDIUM;
              const vals = editValues[rule.id] || { responseHours: rule.responseHours, resolutionHours: rule.resolutionHours };
              const hasChanges = vals.responseHours !== rule.responseHours || vals.resolutionHours !== rule.resolutionHours;

              return (
                <div key={rule.id} className="glass-card p-5 animate-slideUp" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${info.color}`} />
                    <h3 className="text-sm font-semibold text-white">{info.label}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-800 text-surface-400 uppercase">{rule.priority}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-surface-400 mb-1.5">Response Time (hours)</label>
                      <input
                        type="number" min={1}
                        value={vals.responseHours}
                        onChange={e => setEditValues({ ...editValues, [rule.id]: { ...vals, responseHours: Number(e.target.value) } })}
                        className="w-full px-3 py-2 bg-surface-800/50 border border-surface-700 rounded-xl text-sm text-white focus:border-primary-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-400 mb-1.5">Resolution Time (hours)</label>
                      <input
                        type="number" min={1}
                        value={vals.resolutionHours}
                        onChange={e => setEditValues({ ...editValues, [rule.id]: { ...vals, resolutionHours: Number(e.target.value) } })}
                        className="w-full px-3 py-2 bg-surface-800/50 border border-surface-700 rounded-xl text-sm text-white focus:border-primary-500 transition-colors"
                      />
                    </div>
                  </div>

                  {hasChanges && (
                    <button
                      onClick={() => handleSave(rule)}
                      disabled={saving === rule.id}
                      className="mt-3 px-4 py-1.5 text-xs font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                    >
                      {saving === rule.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save Changes
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
