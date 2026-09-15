import { supabase } from '../lib/supabase';
import { AppError } from '../middleware/error.middleware';
import bcrypt from 'bcryptjs';

export class UserService {
  async findAll(params: { page: number; limit: number; role?: string; search?: string }) {
    const { page, limit, role, search } = params;
    const skip = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select('id, email, name, role, phone, avatar, isActive, departmentId, createdAt, departments!departmentId(id, name)', { count: 'exact' });

    if (role) {
      query = query.eq('role', role);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order('createdAt', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw new AppError('Failed to fetch users: ' + error.message, 500);

    const total = count || 0;
    const users = data.map(u => {
      const { departments, ...rest } = u;
      return { ...rest, department: departments };
    });

    return { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, phone, avatar, isActive, departmentId, createdAt, departments!departmentId(id, name)')
      .eq('id', id)
      .maybeSingle();

    if (error || !user) throw new AppError('User not found', 404);
    
    const { departments, ...rest } = user as any;
    return { ...rest, department: departments };
  }

  async update(id: string, data: any) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }
    
    // Remove department from data if it was passed accidentally
    delete data.department;

    const { data: user, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select('id, email, name, role, phone, avatar, isActive, departmentId, createdAt, departments!departmentId(id, name)')
      .single();

    if (error) throw new AppError('Failed to update user', 500);

    const { departments, ...rest } = user as any;
    return { ...rest, department: departments };
  }

  async getStaffByDepartment(departmentId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('departmentId', departmentId)
      .eq('role', 'STAFF')
      .eq('isActive', true);

    if (error) throw new AppError('Failed to fetch staff', 500);
    return data;
  }

  async delete(id: string) {
    // Check if they are assigned to any complaints
    const { count, error: countErr } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .or(`userId.eq.${id},assignedToId.eq.${id}`);

    if (countErr) throw new AppError('Error checking user complaints', 500);
    if ((count || 0) > 0) throw new AppError('Cannot completely delete user because they are linked to existing complaints. Please edit and deactivate their account instead.', 400);

    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw new AppError('Failed to delete user. Please deactivate instead.', 500);
    return { success: true };
  }
}

export const userService = new UserService();
