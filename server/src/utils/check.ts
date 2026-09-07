import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');

async function test() {
  const { data, error } = await supabase.from('users').insert({
    email: 'test@test.com',
    name: 'Test',
    password: 'password'
  }).select();
  console.log("Insert result:", data);
  if (error) console.error("Insert error:", error);
}

test();
