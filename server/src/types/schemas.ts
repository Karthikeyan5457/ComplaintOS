import { z } from 'zod';
import { PRIORITIES, COMPLAINT_STATUSES, ROLES, SENTIMENTS } from '../config/constants';

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Complaint schemas
export const createComplaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  location: z.string().optional(),
  contactInfo: z.string().optional(),
  categoryId: z.string().optional(),
  departmentId: z.string().optional(),
  priority: z.enum(PRIORITIES).optional(),
});

export const updateComplaintSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).max(5000).optional(),
  location: z.string().optional(),
  contactInfo: z.string().optional(),
  categoryId: z.string().optional(),
  departmentId: z.string().optional(),
  priority: z.enum(PRIORITIES).optional(),
  assignedToId: z.string().optional(),
  resolutionNotes: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(COMPLAINT_STATUSES),
  note: z.string().optional(),
  resolutionNotes: z.string().optional(),
});

export const assignComplaintSchema = z.object({
  assignedToId: z.string().min(1, 'Assignee is required'),
  note: z.string().optional(),
});

// Comment schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000),
  isInternal: z.boolean().optional().default(false),
});

// Department schemas
export const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().optional(),
  headId: z.string().optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});

// User management schemas
export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(ROLES).optional(),
  departmentId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
});

// SLA schemas
export const updateSlaRuleSchema = z.object({
  responseHours: z.number().min(1).optional(),
  resolutionHours: z.number().min(1).optional(),
  isActive: z.boolean().optional(),
});

// AI Analysis schema — validates AI response
export const aiAnalysisResponseSchema = z.object({
  category: z.string(),
  subcategory: z.string().optional().default(''),
  priority: z.enum(PRIORITIES),
  department: z.string(),
  summary: z.string(),
  suggestedResolution: z.string(),
  sentiment: z.enum(SENTIMENTS),
  confidence: z.number().min(0).max(1),
});

export type AIAnalysisResponse = z.infer<typeof aiAnalysisResponseSchema>;

// Query params
export const complaintQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
  status: z.string().optional(),
  priority: z.string().optional(),
  categoryId: z.string().optional(),
  departmentId: z.string().optional(),
  assignedToId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});
