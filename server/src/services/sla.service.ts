import { supabase } from '../lib/supabase';
import { DEFAULT_SLA_HOURS } from '../config/constants';
import { AppError } from '../middleware/error.middleware';

export class SlaService {
  async findAll() {
    const { data, error } = await supabase
      .from('sla_rules')
      .select('*')
      .order('priority', { ascending: true });

    if (error) throw new AppError('Failed to fetch SLA rules', 500);
    return data;
  }

  async update(id: string, data: { responseHours?: number; resolutionHours?: number; isActive?: boolean }) {
    const { data: updated, error } = await supabase
      .from('sla_rules')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError('Failed to update SLA rule', 500);
    return updated;
  }

  async initDefaults() {
    const entries = Object.entries(DEFAULT_SLA_HOURS);
    for (const [priority, hours] of entries) {
      await supabase.from('sla_rules').upsert({
        priority: priority as any,
        responseHours: Math.floor(hours / 2),
        resolutionHours: hours
      }, { onConflict: 'priority', ignoreDuplicates: true });
    }
  }

  async checkOverdue() {
    const now = new Date();
    
    // In Supabase we can do multiple neq instead of notIn for simplicity
    const { data, error } = await supabase
      .from('complaints')
      .update({ slaBreached: true })
      .lt('slaDeadline', now.toISOString())
      .eq('slaBreached', false)
      .neq('status', 'RESOLVED')
      .neq('status', 'CLOSED')
      .select('id');

    if (error) {
      console.error('Failed to check overdue SLAs', error);
      return 0;
    }
    
    return data?.length || 0;
  }
}

export const slaService = new SlaService();
