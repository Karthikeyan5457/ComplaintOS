import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = process.env.SUPABASE_URL || '';
// Use SERVICE_ROLE_KEY to bypass RLS in the backend, fallback to ANON_KEY
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
