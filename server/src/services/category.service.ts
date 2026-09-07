import { supabase } from '../lib/supabase';
import { AppError } from '../middleware/error.middleware';

export class CategoryService {
  async findAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*, parent:parentId(id, name), children:categories!parentId(id, name), complaints(count)')
      .order('name', { ascending: true });

    if (error) throw new AppError('Failed to fetch categories: ' + error.message, 500);

    return data.map(c => ({
      ...c,
      _count: { complaints: Array.isArray(c.complaints) ? c.complaints[0]?.count || 0 : 0 }
    }));
  }

  async findById(id: string) {
    const { data: cat, error } = await supabase
      .from('categories')
      .select('*, parent:parentId(id, name), children:categories!parentId(id, name, isActive), complaints(count)')
      .eq('id', id)
      .maybeSingle();

    if (error || !cat) throw new AppError('Category not found', 404);
    
    return {
      ...cat,
      _count: { complaints: Array.isArray(cat.complaints) ? cat.complaints[0]?.count || 0 : 0 }
    };
  }

  async create(data: { name: string; description?: string; icon?: string; parentId?: string }) {
    const { data: created, error } = await supabase
      .from('categories')
      .insert(data)
      .select('*, complaints(count)')
      .single();

    if (error) throw new AppError('Failed to create category', 500);
    return {
      ...created,
      _count: { complaints: 0 }
    };
  }

  async update(id: string, data: any) {
    const { data: updated, error } = await supabase
      .from('categories')
      .update(data)
      .eq('id', id)
      .select('*, complaints(count)')
      .single();

    if (error) throw new AppError('Failed to update category', 500);
    return {
      ...updated,
      _count: { complaints: Array.isArray(updated.complaints) ? updated.complaints[0]?.count || 0 : 0 }
    };
  }

  async delete(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .update({ isActive: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError('Failed to delete category', 500);
    return data;
  }
}

export const categoryService = new CategoryService();
