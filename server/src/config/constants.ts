export const COMPLAINT_STATUSES = [
  'SUBMITTED',
  'AI_ANALYSIS',
  'CLASSIFIED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'REOPENED',
] as const;

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export const ROLES = ['USER', 'STAFF', 'ADMIN'] as const;

export const SENTIMENTS = ['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'VERY_NEGATIVE'] as const;

// Valid status transitions
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ['AI_ANALYSIS', 'CLASSIFIED', 'ASSIGNED'],
  AI_ANALYSIS: ['CLASSIFIED', 'ASSIGNED'],
  CLASSIFIED: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS', 'CLASSIFIED'],
  IN_PROGRESS: ['RESOLVED', 'ASSIGNED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  CLOSED: ['REOPENED'],
  REOPENED: ['ASSIGNED', 'IN_PROGRESS'],
};

export const DEFAULT_SLA_HOURS: Record<string, number> = {
  LOW: 72,
  MEDIUM: 48,
  HIGH: 24,
  CRITICAL: 4,
};

export const TRACKING_ID_PREFIX = 'CMP';
