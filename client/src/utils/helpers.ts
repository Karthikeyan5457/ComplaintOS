import type { ComplaintStatus, Priority } from '../types';

export function getStatusColor(status: ComplaintStatus): string {
  const colors: Record<ComplaintStatus, string> = {
    SUBMITTED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    AI_ANALYSIS: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    CLASSIFIED: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    ASSIGNED: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    IN_PROGRESS: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    RESOLVED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    CLOSED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    REOPENED: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };
  return colors[status] || colors.SUBMITTED;
}

export function getPriorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    LOW: 'bg-green-500/20 text-green-400 border-green-500/30',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[priority] || colors.MEDIUM;
}

export function getPriorityDot(priority: Priority): string {
  const colors: Record<Priority, string> = {
    LOW: 'bg-green-400',
    MEDIUM: 'bg-yellow-400',
    HIGH: 'bg-orange-400',
    CRITICAL: 'bg-red-400',
  };
  return colors[priority] || 'bg-gray-400';
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function getSlaStatus(deadline: string | undefined): { label: string; color: string; isOverdue: boolean } {
  if (!deadline) return { label: 'No SLA', color: 'text-gray-500', isOverdue: false };
  const now = new Date();
  const dl = new Date(deadline);
  const diff = dl.getTime() - now.getTime();
  if (diff < 0) {
    const hours = Math.abs(Math.floor(diff / 3600000));
    return { label: `Overdue by ${hours}h`, color: 'text-red-400', isOverdue: true };
  }
  const hours = Math.floor(diff / 3600000);
  if (hours < 4) return { label: `${hours}h remaining`, color: 'text-red-400', isOverdue: false };
  if (hours < 12) return { label: `${hours}h remaining`, color: 'text-amber-400', isOverdue: false };
  return { label: `${hours}h remaining`, color: 'text-green-400', isOverdue: false };
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
