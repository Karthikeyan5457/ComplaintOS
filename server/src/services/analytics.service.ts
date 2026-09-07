import { supabase } from '../lib/supabase';
import { AppError } from '../middleware/error.middleware';

export class AnalyticsService {
  async getDashboardStats() {
    // Fetch all complaints with necessary fields to calculate stats in memory, 
    // since Supabase JS doesn't natively support GROUP BY without RPCs.
    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('id, status, priority, categoryId, departmentId, slaBreached, createdAt, resolvedAt, slaDeadline');

    if (error) throw new AppError('Failed to fetch analytics data', 500);

    const total = complaints.length;
    let submitted = 0, inProgress = 0, resolved = 0, closed = 0, overdue = 0, critical = 0;
    
    const statusMap: Record<string, number> = {};
    const priorityMap: Record<string, number> = {};
    const categoryCountMap: Record<string, number> = {};
    const departmentCountMap: Record<string, number> = {};
    
    let resolvedCount = 0;
    let totalResolutionHours = 0;
    
    let totalWithSla = 0;
    let breached = 0;

    for (const c of complaints) {
      // Basic counts
      if (['SUBMITTED', 'AI_ANALYSIS', 'CLASSIFIED'].includes(c.status)) submitted++;
      if (c.status === 'IN_PROGRESS') inProgress++;
      if (c.status === 'RESOLVED') resolved++;
      if (c.status === 'CLOSED') closed++;
      
      if (c.slaBreached && !['RESOLVED', 'CLOSED'].includes(c.status)) overdue++;
      if (c.priority === 'CRITICAL' && !['RESOLVED', 'CLOSED'].includes(c.status)) critical++;

      // Group by
      statusMap[c.status] = (statusMap[c.status] || 0) + 1;
      priorityMap[c.priority] = (priorityMap[c.priority] || 0) + 1;
      
      if (c.categoryId) categoryCountMap[c.categoryId] = (categoryCountMap[c.categoryId] || 0) + 1;
      if (c.departmentId) departmentCountMap[c.departmentId] = (departmentCountMap[c.departmentId] || 0) + 1;
      
      // Avg resolution time
      if (c.resolvedAt) {
        resolvedCount++;
        const diff = (new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60);
        totalResolutionHours += diff;
      }
      
      // SLA compliance
      if (c.slaDeadline) {
        totalWithSla++;
        if (c.slaBreached) breached++;
      }
    }

    const avgResolutionHours = resolvedCount > 0 ? Math.round(totalResolutionHours / resolvedCount) : 0;
    const slaCompliance = totalWithSla > 0 ? Math.round(((totalWithSla - breached) / totalWithSla) * 100) : 100;

    // Fetch category and department names
    const [{ data: categories }, { data: departments }] = await Promise.all([
      supabase.from('categories').select('id, name'),
      supabase.from('departments').select('id, name')
    ]);

    const categoryMap = Object.fromEntries((categories || []).map(c => [c.id, c.name]));
    const departmentMap = Object.fromEntries((departments || []).map(d => [d.id, d.name]));

    return {
      total,
      new: submitted,
      inProgress,
      resolved,
      closed,
      overdue,
      critical,
      avgResolutionHours,
      slaCompliance,
      byStatus: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
      byPriority: Object.entries(priorityMap).map(([priority, count]) => ({ priority, count })),
      byCategory: Object.entries(categoryCountMap).map(([categoryId, count]) => ({ category: categoryMap[categoryId] || 'Unknown', count })),
      byDepartment: Object.entries(departmentCountMap).map(([departmentId, count]) => ({ department: departmentMap[departmentId] || 'Unknown', count })),
    };
  }

  async getTrends(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('createdAt, status, priority')
      .gte('createdAt', startDate.toISOString())
      .order('createdAt', { ascending: true });

    if (error) throw new AppError('Failed to fetch trend data', 500);

    // Group by date
    const dateMap: Record<string, { date: string; count: number; resolved: number }> = {};
    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      dateMap[key] = { date: key, count: 0, resolved: 0 };
    }

    (complaints || []).forEach(c => {
      const key = new Date(c.createdAt).toISOString().split('T')[0];
      if (dateMap[key]) {
        dateMap[key].count++;
        if (c.status === 'RESOLVED' || c.status === 'CLOSED') {
          dateMap[key].resolved++;
        }
      }
    });

    return Object.values(dateMap);
  }

  async getUserStats(userId: string) {
    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('id, status, createdAt, category:categories!categoryId(name), department:departments!departmentId(name)')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) throw new AppError('Failed to fetch user stats', 500);

    const total = complaints.length;
    let open = 0, inProgress = 0, resolved = 0, closed = 0;

    for (const c of complaints) {
      if (['SUBMITTED', 'AI_ANALYSIS', 'CLASSIFIED', 'ASSIGNED'].includes(c.status)) open++;
      if (c.status === 'IN_PROGRESS') inProgress++;
      if (c.status === 'RESOLVED') resolved++;
      if (c.status === 'CLOSED') closed++;
    }

    const recentComplaints = complaints.slice(0, 5);

    return { total, open, inProgress, resolved, closed, recentComplaints };
  }

  async getStaffStats(userId: string, departmentId: string | null) {
    let query = supabase.from('complaints').select('id, status, slaBreached, assignedToId');
    if (departmentId) query = query.eq('departmentId', departmentId);

    const { data: complaints, error } = await query;
    if (error) throw new AppError('Failed to fetch staff stats', 500);

    const total = complaints.length;
    let assigned = 0, inProgress = 0, resolved = 0, overdue = 0;

    for (const c of complaints) {
      if (c.assignedToId === userId) assigned++;
      if (c.status === 'IN_PROGRESS') inProgress++;
      if (['RESOLVED', 'CLOSED'].includes(c.status)) resolved++;
      if (c.slaBreached && !['RESOLVED', 'CLOSED'].includes(c.status)) overdue++;
    }

    return { total, assigned, inProgress, resolved, overdue };
  }
}

export const analyticsService = new AnalyticsService();
