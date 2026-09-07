import { TRACKING_ID_PREFIX } from '../config/constants';

export function generateTrackingId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${TRACKING_ID_PREFIX}-${timestamp}-${random}`;
}

export function calculateSlaDeadline(priority: string, slaHours: number): Date {
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + slaHours);
  return deadline;
}

export function isSlaBreached(deadline: Date | null): boolean {
  if (!deadline) return false;
  return new Date() > deadline;
}

export function getTimeRemaining(deadline: Date | null): { hours: number; minutes: number; isOverdue: boolean } | null {
  if (!deadline) return null;
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  const isOverdue = diff < 0;
  const absDiff = Math.abs(diff);
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes, isOverdue };
}
