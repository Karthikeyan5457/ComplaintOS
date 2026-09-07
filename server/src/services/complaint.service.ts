import { supabase } from '../lib/supabase';
import { AppError } from '../middleware/error.middleware';
import { STATUS_TRANSITIONS, DEFAULT_SLA_HOURS } from '../config/constants';
import { generateTrackingId, calculateSlaDeadline } from '../utils/helpers';
import { aiService } from './ai.service';
import type { Database } from '../types/database.types';

type Priority = Database['public']['Enums']['priority_type'];
type ComplaintStatus = Database['public']['Enums']['complaint_status_type'];

export class ComplaintService {
  async create(data: {
    title: string;
    description: string;
    location?: string;
    contactInfo?: string;
    categoryId?: string;
    departmentId?: string;
    priority?: string;
    userId: string;
  }) {
    const trackingId = generateTrackingId();

    // Get SLA hours for priority
    const priority = (data.priority || 'MEDIUM') as Priority;
    const { data: slaRule } = await supabase.from('sla_rules').select('*').eq('priority', priority).maybeSingle();
    const slaHours = slaRule?.resolutionHours || DEFAULT_SLA_HOURS[priority as keyof typeof DEFAULT_SLA_HOURS] || 48;
    const slaDeadline = calculateSlaDeadline(priority, slaHours);

    const { data: complaint, error: createError } = await supabase
      .from('complaints')
      .insert({
        trackingId,
        title: data.title,
        description: data.description,
        location: data.location || null,
        contactInfo: data.contactInfo || null,
        categoryId: data.categoryId || null,
        departmentId: data.departmentId || null,
        priority,
        status: 'SUBMITTED',
        userId: data.userId,
        slaDeadline: slaDeadline.toISOString(),
      })
      .select(`
        *,
        user:users!userId(id, name, email),
        category:categories!categoryId(id, name),
        department:departments!departmentId(id, name),
        assignedTo:users!assignedToId(id, name, email)
      `)
      .single();

    if (createError) throw new AppError('Failed to create complaint', 500);

    // Record history
    await supabase.from('complaint_history').insert({
      complaintId: complaint.id,
      action: 'CREATED',
      newValue: 'SUBMITTED',
      userId: data.userId,
      note: 'Complaint submitted',
    });

    // Trigger AI analysis asynchronously (don't await)
    this.runAiAnalysis(complaint.id, data.title, data.description).catch(err => {
      console.error('AI analysis background task failed:', err);
    });

    return complaint;
  }

  private async runAiAnalysis(complaintId: string, title: string, description: string) {
    try {
      // Update status to AI_ANALYSIS
      await supabase.from('complaints').update({ status: 'AI_ANALYSIS' }).eq('id', complaintId);

      const [analysis, duplicates] = await Promise.all([
        aiService.analyzeComplaint(title, description),
        aiService.detectDuplicates(title, description),
      ]);

      if (analysis) {
        // Find matching category and department
        const { data: category } = await supabase.from('categories').select('id').eq('name', analysis.category).eq('isActive', true).maybeSingle();
        const { data: department } = await supabase.from('departments').select('id').eq('name', analysis.department).eq('isActive', true).maybeSingle();

        // Recalculate SLA based on AI priority
        const aiPriority = analysis.priority as Priority;
        const { data: slaRule } = await supabase.from('sla_rules').select('*').eq('priority', aiPriority).maybeSingle();
        const slaHours = slaRule?.resolutionHours || DEFAULT_SLA_HOURS[aiPriority as keyof typeof DEFAULT_SLA_HOURS] || 48;

        await supabase.from('complaints').update({
          status: 'CLASSIFIED',
          aiAnalysis: analysis as any,
          aiCategory: analysis.category,
          aiSubcategory: analysis.subcategory,
          aiPriority: analysis.priority,
          aiDepartment: analysis.department,
          aiSummary: analysis.summary,
          aiSuggestedResolution: analysis.suggestedResolution,
          aiSentiment: analysis.sentiment as any,
          aiConfidence: analysis.confidence,
          aiAnalyzedAt: new Date().toISOString(),
          categoryId: category?.id || null,
          departmentId: department?.id || null,
          priority: aiPriority,
          slaDeadline: calculateSlaDeadline(aiPriority, slaHours).toISOString(),
        }).eq('id', complaintId);

        await supabase.from('complaint_history').insert({
          complaintId,
          action: 'AI_CLASSIFIED',
          newValue: `Category: ${analysis.category}, Priority: ${analysis.priority}, Department: ${analysis.department}`,
          note: `AI analysis completed with ${Math.round(analysis.confidence * 100)}% confidence. ${duplicates.length > 0 ? `${duplicates.length} potential duplicate(s) detected.` : ''}`,
        });
      } else {
        // AI failed — mark and continue
        await supabase.from('complaints').update({
          status: 'SUBMITTED',
          aiError: 'AI analysis unavailable. Manual classification required.',
        }).eq('id', complaintId);

        await supabase.from('complaint_history').insert({
          complaintId,
          action: 'AI_FAILED',
          note: 'AI analysis failed. Complaint requires manual classification.',
        });
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      await supabase.from('complaints').update({
        status: 'SUBMITTED',
        aiError: 'AI analysis encountered an error.',
      }).eq('id', complaintId);
    }
  }

  async findById(id: string) {
    const { data: complaint, error } = await supabase
      .from('complaints')
      .select(`
        *,
        user:users!userId(id, name, email),
        category:categories!categoryId(id, name),
        department:departments!departmentId(id, name),
        assignedTo:users!assignedToId(id, name, email),
        comments(id, content, isInternal, createdAt, updatedAt, userId, user:users!userId(id, name, role)),
        attachments(*),
        history:complaint_history(*, user:users!userId(id, name))
      `)
      .eq('id', id)
      .maybeSingle();

    if (error || !complaint) throw new AppError('Complaint not found', 404);

    // Sort relations in JS
    if (complaint.comments) complaint.comments.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (complaint.history) complaint.history.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return complaint;
  }

  async findAll(params: {
    page: number;
    limit: number;
    status?: string;
    priority?: string;
    categoryId?: string;
    departmentId?: string;
    assignedToId?: string;
    userId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    dateFrom?: string;
    dateTo?: string;
  }) {
    const { page, limit, status, priority, categoryId, departmentId, assignedToId, userId, search, sortBy, sortOrder, dateFrom, dateTo } = params;
    const skip = (page - 1) * limit;

    let query = supabase
      .from('complaints')
      .select(`
        *,
        user:users!userId(id, name),
        category:categories!categoryId(id, name),
        department:departments!departmentId(id, name),
        assignedTo:users!assignedToId(id, name)
      `, { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (categoryId) query = query.eq('categoryId', categoryId);
    if (departmentId) query = query.eq('departmentId', departmentId);
    if (assignedToId) query = query.eq('assignedToId', assignedToId);
    if (userId) query = query.eq('userId', userId);
    
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,trackingId.ilike.%${search}%`);
    
    if (dateFrom) query = query.gte('createdAt', new Date(dateFrom).toISOString());
    if (dateTo) query = query.lte('createdAt', new Date(dateTo).toISOString());

    const sortField = sortBy || 'createdAt';
    const isAscending = sortOrder === 'asc';

    const { data, count, error } = await query
      .order(sortField, { ascending: isAscending })
      .range(skip, skip + limit - 1);

    if (error) throw new AppError('Failed to fetch complaints: ' + error.message, 500);

    const total = count || 0;
    return {
      complaints: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(complaintId: string, status: string, userId: string, note?: string, resolutionNotes?: string) {
    const { data: complaint } = await supabase.from('complaints').select('status, userId, trackingId').eq('id', complaintId).maybeSingle();
    if (!complaint) throw new AppError('Complaint not found', 404);

    const validTransitions = STATUS_TRANSITIONS[complaint.status] || [];
    if (!validTransitions.includes(status)) {
      throw new AppError(`Invalid status transition from ${complaint.status} to ${status}`, 400);
    }

    const updateData: any = { status };
    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date().toISOString();
      if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
    }
    if (status === 'CLOSED') updateData.closedAt = new Date().toISOString();
    if (status === 'REOPENED') {
      updateData.resolvedAt = null;
      updateData.closedAt = null;
    }

    const { data: updated, error } = await supabase
      .from('complaints')
      .update(updateData)
      .eq('id', complaintId)
      .select(`
        *,
        user:users!userId(id, name, email),
        category:categories!categoryId(id, name),
        department:departments!departmentId(id, name),
        assignedTo:users!assignedToId(id, name, email)
      `)
      .single();

    if (error) throw new AppError('Failed to update status', 500);

    await supabase.from('complaint_history').insert({
      complaintId,
      action: 'STATUS_CHANGED',
      oldValue: complaint.status,
      newValue: status,
      userId,
      note: note || `Status changed to ${status}`,
    });

    // Create notification for complaint owner
    if (complaint.userId !== userId) {
      await supabase.from('notifications').insert({
        userId: complaint.userId,
        title: `Complaint ${complaint.trackingId} Updated`,
        message: `Your complaint status has been changed to ${status}`,
        type: 'status_change',
        complaintId,
      });
    }

    return updated;
  }

  async assign(complaintId: string, assignedToId: string, assignedByUserId: string, note?: string) {
    const { data: complaint } = await supabase.from('complaints').select('status, trackingId, title').eq('id', complaintId).maybeSingle();
    if (!complaint) throw new AppError('Complaint not found', 404);

    const { data: assignee } = await supabase.from('users').select('name').eq('id', assignedToId).maybeSingle();
    if (!assignee) throw new AppError('Assignee not found', 404);

    const { data: updated, error } = await supabase
      .from('complaints')
      .update({
        assignedToId,
        status: complaint.status === 'CLASSIFIED' || complaint.status === 'SUBMITTED' || complaint.status === 'REOPENED'
          ? 'ASSIGNED'
          : complaint.status,
      })
      .eq('id', complaintId)
      .select(`
        *,
        user:users!userId(id, name),
        category:categories!categoryId(id, name),
        department:departments!departmentId(id, name),
        assignedTo:users!assignedToId(id, name, email)
      `)
      .single();

    if (error) throw new AppError('Failed to assign complaint', 500);

    await supabase.from('complaint_history').insert({
      complaintId,
      action: 'ASSIGNED',
      newValue: assignee.name,
      userId: assignedByUserId,
      note: note || `Assigned to ${assignee.name}`,
    });

    // Notify assignee
    await supabase.from('notifications').insert({
      userId: assignedToId,
      title: 'New Complaint Assigned',
      message: `Complaint ${complaint.trackingId}: ${complaint.title}`,
      type: 'assignment',
      complaintId,
    });

    return updated;
  }

  async addComment(complaintId: string, userId: string, content: string, isInternal: boolean = false) {
    const { data: complaint } = await supabase.from('complaints').select('id').eq('id', complaintId).maybeSingle();
    if (!complaint) throw new AppError('Complaint not found', 404);

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({ content, isInternal, complaintId, userId })
      .select(`*, user:users!userId(id, name, role)`)
      .single();

    if (error) throw new AppError('Failed to add comment', 500);

    await supabase.from('complaint_history').insert({
      complaintId,
      action: isInternal ? 'INTERNAL_COMMENT' : 'COMMENT_ADDED',
      userId,
      note: content.substring(0, 100),
    });

    return comment;
  }

  async update(complaintId: string, data: any, userId: string) {
    const { data: complaint } = await supabase.from('complaints').select('priority, categoryId, departmentId').eq('id', complaintId).maybeSingle();
    if (!complaint) throw new AppError('Complaint not found', 404);

    const changes: string[] = [];
    if (data.priority && data.priority !== complaint.priority) changes.push(`Priority: ${complaint.priority} → ${data.priority}`);
    if (data.categoryId && data.categoryId !== complaint.categoryId) changes.push('Category changed');
    if (data.departmentId && data.departmentId !== complaint.departmentId) changes.push('Department changed');

    // Recalculate SLA if priority changed
    if (data.priority && data.priority !== complaint.priority) {
      const { data: slaRule } = await supabase.from('sla_rules').select('*').eq('priority', data.priority).maybeSingle();
      const slaHours = slaRule?.resolutionHours || DEFAULT_SLA_HOURS[data.priority as keyof typeof DEFAULT_SLA_HOURS] || 48;
      data.slaDeadline = calculateSlaDeadline(data.priority, slaHours).toISOString();
    }

    const { data: updated, error } = await supabase
      .from('complaints')
      .update(data)
      .eq('id', complaintId)
      .select(`
        *,
        user:users!userId(id, name),
        category:categories!categoryId(id, name),
        department:departments!departmentId(id, name),
        assignedTo:users!assignedToId(id, name, email)
      `)
      .single();

    if (error) throw new AppError('Failed to update complaint', 500);

    if (changes.length > 0) {
      await supabase.from('complaint_history').insert({
        complaintId,
        action: 'UPDATED',
        userId,
        note: changes.join('; '),
      });
    }

    return updated;
  }
}

export const complaintService = new ComplaintService();
