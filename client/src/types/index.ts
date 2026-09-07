export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
  phone?: string;
  avatar?: string;
  isActive: boolean;
  departmentId?: string | null;
  department?: { id: string; name: string } | null;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  headId?: string;
  head?: { id: string; name: string; email: string } | null;
  staff?: User[];
  _count?: { staff: number; complaints: number };
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  parentId?: string | null;
  parent?: { id: string; name: string } | null;
  children?: Category[];
  _count?: { complaints: number };
}

export interface Complaint {
  id: string;
  trackingId: string;
  title: string;
  description: string;
  location?: string;
  contactInfo?: string;
  status: ComplaintStatus;
  priority: Priority;
  userId: string;
  user: { id: string; name: string; email?: string };
  categoryId?: string;
  category?: { id: string; name: string } | null;
  departmentId?: string;
  department?: { id: string; name: string } | null;
  assignedToId?: string;
  assignedTo?: { id: string; name: string; email?: string } | null;
  aiAnalysis?: any;
  aiCategory?: string;
  aiSubcategory?: string;
  aiPriority?: string;
  aiDepartment?: string;
  aiSummary?: string;
  aiSuggestedResolution?: string;
  aiSentiment?: string;
  aiConfidence?: number;
  aiAnalyzedAt?: string;
  aiError?: string;
  slaDeadline?: string;
  slaBreached: boolean;
  resolutionNotes?: string;
  resolvedAt?: string;
  closedAt?: string;
  comments?: Comment[];
  attachments?: Attachment[];
  history?: ComplaintHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  isInternal: boolean;
  complaintId: string;
  userId: string;
  user: { id: string; name: string; role: string };
  createdAt: string;
}

export interface ComplaintHistory {
  id: string;
  complaintId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  userId?: string;
  user?: { id: string; name: string } | null;
  note?: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface SlaRule {
  id: string;
  priority: Priority;
  responseHours: number;
  resolutionHours: number;
  isActive: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  userId: string;
  complaintId?: string;
  createdAt: string;
}

export type ComplaintStatus = 'SUBMITTED' | 'AI_ANALYSIS' | 'CLASSIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Role = 'USER' | 'STAFF' | 'ADMIN';

export interface PaginatedResponse<T> {
  complaints: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  total: number;
  new: number;
  inProgress: number;
  resolved: number;
  closed: number;
  overdue: number;
  critical: number;
  avgResolutionHours: number;
  slaCompliance: number;
  byStatus: { status: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  byCategory: { category: string; count: number }[];
  byDepartment: { department: string; count: number }[];
}

export interface TrendData {
  date: string;
  count: number;
  resolved: number;
}

export interface UserStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  recentComplaints: Complaint[];
}
