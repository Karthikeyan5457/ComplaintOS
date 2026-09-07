import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintsApi, usersApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/layout/Header';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badges';
import Modal from '../../components/ui/Modal';
import { formatDateTime, formatRelativeTime, getSlaStatus, statusLabel } from '../../utils/helpers';
import {
  ArrowLeft, MapPin, Phone, Brain, Sparkles, Clock, MessageSquare,
  History, Send, AlertTriangle, CheckCircle, User as UserIcon, Paperclip, RefreshCw,
} from 'lucide-react';
import type { Complaint, User } from '../../types';

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [staffList, setStaffList] = useState<User[]>([]);
  const [assigneeId, setAssigneeId] = useState('');

  const isStaffOrAdmin = user?.role === 'STAFF' || user?.role === 'ADMIN';

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const loadComplaint = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await complaintsApi.findById(id);
      setComplaint(data);
      if (data.departmentId && isStaffOrAdmin) {
        try {
          const { data: staff } = await usersApi.getStaffByDepartment(data.departmentId);
          setStaffList(staff);
        } catch {}
      }
    } catch {}
    setLoading(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !comment.trim()) return;
    setSending(true);
    try {
      await complaintsApi.addComment(id, { content: comment, isInternal });
      setComment('');
      loadComplaint();
    } catch {}
    setSending(false);
  };

  const handleStatusChange = async () => {
    if (!id || !newStatus) return;
    try {
      await complaintsApi.updateStatus(id, { status: newStatus, note: statusNote, resolutionNotes });
      setShowStatusModal(false);
      setNewStatus('');
      setStatusNote('');
      setResolutionNotes('');
      loadComplaint();
    } catch {}
  };

  const handleAssign = async () => {
    if (!id || !assigneeId) return;
    try {
      await complaintsApi.assign(id, { assignedToId: assigneeId });
      setShowAssignModal(false);
      setAssigneeId('');
      loadComplaint();
    } catch {}
  };

  if (loading) {
    return (
      <div>
        <Header title="Complaint Details" />
        <div className="p-6 space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div>
        <Header title="Complaint Not Found" />
        <div className="p-6 text-center py-16">
          <p className="text-surface-400">Complaint not found</p>
          <Link to="/complaints" className="text-primary-400 mt-2 inline-block">← Back to complaints</Link>
        </div>
      </div>
    );
  }

  const sla = getSlaStatus(complaint.slaDeadline);
  const statusTransitions: Record<string, string[]> = {
    SUBMITTED: ['ASSIGNED'], AI_ANALYSIS: ['CLASSIFIED', 'ASSIGNED'], CLASSIFIED: ['ASSIGNED'],
    ASSIGNED: ['IN_PROGRESS'], IN_PROGRESS: ['RESOLVED'], RESOLVED: ['CLOSED', 'REOPENED'],
    CLOSED: ['REOPENED'], REOPENED: ['ASSIGNED', 'IN_PROGRESS'],
  };
  const validTransitions = statusTransitions[complaint.status] || [];

  return (
    <div>
      <Header title={complaint.trackingId} />
      <div className="p-6">
        <Link to="/complaints" className="inline-flex items-center gap-1.5 text-sm text-surface-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Complaints
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title card */}
            <div className="glass-card p-6 animate-slideUp">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
                {sla.isOverdue && (
                  <span className="badge border bg-red-500/20 text-red-400 border-red-500/30">
                    <AlertTriangle className="w-3 h-3" /> OVERDUE
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-white mb-2">{complaint.title}</h1>
              <p className="text-surface-300 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>

              <div className="flex flex-wrap gap-4 mt-4 text-xs text-surface-500">
                {complaint.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {complaint.location}</span>
                )}
                {complaint.contactInfo && (
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {complaint.contactInfo}</span>
                )}
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDateTime(complaint.createdAt)}</span>
              </div>

              {/* Action buttons */}
              {isStaffOrAdmin && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-surface-800">
                  {validTransitions.length > 0 && (
                    <button
                      onClick={() => setShowStatusModal(true)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-600/20 text-primary-400 hover:bg-primary-600/30 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3 inline mr-1" /> Update Status
                    </button>
                  )}
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 transition-colors"
                  >
                    <UserIcon className="w-3 h-3 inline mr-1" /> Assign
                  </button>
                </div>
              )}

              {/* Reopen for users */}
              {user?.role === 'USER' && complaint.status === 'RESOLVED' && (
                <div className="mt-4 pt-4 border-t border-surface-800">
                  <button
                    onClick={async () => {
                      await complaintsApi.updateStatus(complaint.id, { status: 'REOPENED', note: 'Reopened by user' });
                      loadComplaint();
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 transition-colors"
                  >
                    Reopen Complaint
                  </button>
                </div>
              )}
            </div>

            {/* AI Analysis */}
            {complaint.aiAnalysis && (
              <div className="glass-card p-6 animate-slideUp" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-semibold text-white">AI Analysis</h3>
                  {complaint.aiConfidence !== undefined && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-medium">
                      {Math.round(complaint.aiConfidence * 100)}% confidence
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Category', value: complaint.aiCategory },
                    { label: 'Priority', value: complaint.aiPriority },
                    { label: 'Department', value: complaint.aiDepartment },
                    { label: 'Sentiment', value: complaint.aiSentiment },
                  ].map(item => item.value && (
                    <div key={item.label} className="p-3 rounded-xl bg-surface-800/50">
                      <p className="text-[10px] text-surface-500 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm text-white font-medium mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
                {complaint.aiSummary && (
                  <div className="mt-3 p-3 rounded-xl bg-surface-800/50">
                    <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-1">AI Summary</p>
                    <p className="text-sm text-surface-300">{complaint.aiSummary}</p>
                  </div>
                )}
                {complaint.aiSuggestedResolution && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-[10px] text-emerald-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Suggested Resolution</p>
                    <p className="text-sm text-surface-300">{complaint.aiSuggestedResolution}</p>
                  </div>
                )}
              </div>
            )}

            {complaint.aiError && (
              <div className="glass-card p-4 border-amber-500/20 animate-slideUp" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-2 text-amber-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>AI Analysis: {complaint.aiError}</span>
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="glass-card p-6 animate-slideUp" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Comments ({complaint.comments?.length || 0})</h3>
              </div>

              {/* Comment form */}
              <form onSubmit={handleAddComment} className="mb-4">
                <textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-surface-800/50 border border-surface-700 rounded-xl text-sm text-white placeholder-surface-500 focus:border-primary-500 transition-colors resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  {isStaffOrAdmin && (
                    <label className="flex items-center gap-2 text-xs text-surface-400 cursor-pointer">
                      <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} className="rounded" />
                      Internal note (not visible to user)
                    </label>
                  )}
                  <button
                    type="submit"
                    disabled={!comment.trim() || sending}
                    className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-50 transition-colors flex items-center gap-1.5 ml-auto"
                  >
                    <Send className="w-3 h-3" /> Send
                  </button>
                </div>
              </form>

              {/* Comments list */}
              <div className="space-y-3">
                {(complaint.comments || []).map(c => (
                  <div key={c.id} className={`p-3 rounded-xl ${c.isInternal ? 'bg-amber-500/5 border border-amber-500/10' : 'bg-surface-800/30'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-primary-600/30 flex items-center justify-center text-[10px] font-bold text-primary-400">
                        {c.user.name.charAt(0)}
                      </div>
                      <span className="text-xs font-medium text-white">{c.user.name}</span>
                      <span className="text-[10px] text-surface-500">{c.user.role}</span>
                      {c.isInternal && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">Internal</span>}
                      <span className="text-[10px] text-surface-600 ml-auto">{formatRelativeTime(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-surface-300 pl-8">{c.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <div className="glass-card p-5 animate-slideUp" style={{ animationDelay: '50ms' }}>
              <h3 className="text-sm font-semibold text-white mb-3">Details</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Submitted by', value: complaint.user.name },
                  { label: 'Category', value: complaint.category?.name || 'Uncategorized' },
                  { label: 'Department', value: complaint.department?.name || 'Unassigned' },
                  { label: 'Assigned to', value: complaint.assignedTo?.name || 'Nobody' },
                  { label: 'Created', value: formatDateTime(complaint.createdAt) },
                  ...(complaint.resolvedAt ? [{ label: 'Resolved', value: formatDateTime(complaint.resolvedAt) }] : []),
                ].map(item => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-surface-500">{item.label}</span>
                    <span className="text-white font-medium text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SLA */}
            <div className="glass-card p-5 animate-slideUp" style={{ animationDelay: '100ms' }}>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" /> SLA Status
              </h3>
              <div className={`text-lg font-bold ${sla.color}`}>{sla.label}</div>
              {complaint.slaDeadline && (
                <p className="text-xs text-surface-500 mt-1">Deadline: {formatDateTime(complaint.slaDeadline)}</p>
              )}
            </div>

            {/* Resolution notes */}
            {complaint.resolutionNotes && (
              <div className="glass-card p-5 animate-slideUp border-emerald-500/10" style={{ animationDelay: '150ms' }}>
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Resolution
                </h3>
                <p className="text-sm text-surface-300">{complaint.resolutionNotes}</p>
              </div>
            )}

            {/* History timeline */}
            <div className="glass-card p-5 animate-slideUp" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">History</h3>
              </div>
              <div className="space-y-0">
                {(complaint.history || []).map((h, i) => (
                  <div key={h.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5" />
                      {i < (complaint.history?.length || 0) - 1 && <div className="w-px flex-1 bg-surface-800 my-1" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-xs font-medium text-white">{h.action.replace(/_/g, ' ')}</p>
                      {h.note && <p className="text-[11px] text-surface-400 mt-0.5">{h.note}</p>}
                      <p className="text-[10px] text-surface-600 mt-0.5">
                        {h.user?.name ? `${h.user.name} • ` : ''}{formatRelativeTime(h.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Modal */}
      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Update Status">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">New Status</label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-xl text-sm text-white"
            >
              <option value="">Select status</option>
              {validTransitions.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </select>
          </div>
          {newStatus === 'RESOLVED' && (
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Resolution Notes</label>
              <textarea
                value={resolutionNotes}
                onChange={e => setResolutionNotes(e.target.value)}
                rows={3}
                className="w-full p-3 bg-surface-800 border border-surface-700 rounded-xl text-sm text-white resize-none"
                placeholder="Describe how this was resolved..."
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Note (optional)</label>
            <input
              value={statusNote}
              onChange={e => setStatusNote(e.target.value)}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-xl text-sm text-white"
              placeholder="Add a note..."
            />
          </div>
          <button
            onClick={handleStatusChange}
            disabled={!newStatus}
            className="w-full py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-500 disabled:opacity-50 text-sm font-medium transition-colors"
          >
            Update Status
          </button>
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Complaint">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Assign to Staff</label>
            <select
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-xl text-sm text-white"
            >
              <option value="">Select staff member</option>
              {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
            </select>
          </div>
          <button
            onClick={handleAssign}
            disabled={!assigneeId}
            className="w-full py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-500 disabled:opacity-50 text-sm font-medium transition-colors"
          >
            Assign
          </button>
        </div>
      </Modal>
    </div>
  );
}
