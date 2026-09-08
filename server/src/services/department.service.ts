import { supabase } from '../lib/supabase';
import { AppError } from '../middleware/error.middleware';

export class DepartmentService {
  async findAll() {
    const { data, error } = await supabase
      .from('departments')
      .select(`
        *,
        head:users!headId(id, name, email),
        staff:users!departmentId(count),
        complaints(count)
      `)
      .order('name', { ascending: true });

    if (error) throw new AppError('Failed to fetch departments', 500);

    return data.map(d => ({
      ...d,
      _count: {
        staff: Array.isArray(d.staff) ? d.staff[0]?.count || 0 : 0,
        complaints: Array.isArray(d.complaints) ? d.complaints[0]?.count || 0 : 0
      }
    }));
  }

  async findById(id: string) {
    const { data: dept, error } = await supabase
      .from('departments')
      .select(`
        *,
        head:users!headId(id, name, email),
        staff:users!departmentId(id, name, email, role),
        complaints(count)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error || !dept) throw new AppError('Department not found', 404);

    return {
      ...dept,
      _count: {
        complaints: Array.isArray(dept.complaints) ? dept.complaints[0]?.count || 0 : 0
      }
    };
  }

  async create(data: { name: string; description?: string; headId?: string }) {
    const { data: created, error } = await supabase
      .from('departments')
      .insert(data)
      .select(`*, head:users!headId(id, name)`)
      .single();

    if (error) throw new AppError('Failed to create department', 500);

    return {
      ...created,
      _count: { staff: 0, complaints: 0 }
    };
  }

  async update(id: string, data: any) {
    const { data: updated, error } = await supabase
      .from('departments')
      .update(data)
      .eq('id', id)
      .select(`*, head:users!headId(id, name)`)
      .single();

    if (error) throw new AppError('Failed to update department', 500);

    return {
      ...updated,
      _count: { staff: 0, complaints: 0 } // Counts would need separate queries or complex joins if required on update
    };
  }

  async delete(id: string) {
    // Check if department has active complaints
    const { count, error: countErr } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('departmentId', id)
      .neq('status', 'CLOSED');

    if (countErr) throw new AppError('Error checking complaints', 500);
    if ((count || 0) > 0) throw new AppError('Cannot delete department with active complaints', 400);

    const { data, error } = await supabase
      .from('departments')
      .update({ isActive: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError('Failed to delete department', 500);
    return data;
  }
}

export const departmentService = new DepartmentService();
