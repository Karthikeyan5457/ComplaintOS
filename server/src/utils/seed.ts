import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert import.meta.url to a path so __dirname works in ES modules if needed, 
// or since tsx runs this, we can just resolve from cwd.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or Supabase Keys in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // 1. SLA Rules
    console.log('Creating SLA Rules...');
    const slaRules = [
      { priority: 'LOW', responseHours: 24, resolutionHours: 72 },
      { priority: 'MEDIUM', responseHours: 12, resolutionHours: 48 },
      { priority: 'HIGH', responseHours: 4, resolutionHours: 24 },
      { priority: 'CRITICAL', responseHours: 1, resolutionHours: 8 },
    ];
    for (const rule of slaRules) {
      const { data: existing } = await supabase.from('sla_rules').select('id').eq('priority', rule.priority).maybeSingle();
      if (!existing) await supabase.from('sla_rules').insert(rule);
    }

    // 2. Departments
    console.log('Creating Departments...');
    const departments = [
      { name: 'IT Support', description: 'Handles all software and hardware issues' },
      { name: 'Infrastructure', description: 'Handles building and facility issues' },
      { name: 'Human Resources', description: 'Handles employee relations' },
    ];
    
    for (const dept of departments) {
      const { data: existing } = await supabase.from('departments').select('id').eq('name', dept.name).maybeSingle();
      if (!existing) await supabase.from('departments').insert(dept);
    }

    const { data: itDept } = await supabase.from('departments').select('id').eq('name', 'IT Support').single();
    const { data: infraDept } = await supabase.from('departments').select('id').eq('name', 'Infrastructure').single();

    // 3. Categories
    console.log('Creating Categories...');
    const categories = [
      { name: 'Software', description: 'Software bugs, access issues, etc.', icon: 'monitor' },
      { name: 'Hardware', description: 'Broken laptops, monitors, etc.', icon: 'hard-drive' },
      { name: 'Facilities', description: 'Plumbing, HVAC, cleaning', icon: 'building' },
      { name: 'Network', description: 'WiFi, VPN, internet', icon: 'wifi' },
    ];
    for (const cat of categories) {
      const { data: existing } = await supabase.from('categories').select('id').eq('name', cat.name).maybeSingle();
      if (!existing) await supabase.from('categories').insert(cat);
    }

    // 4. Users
    console.log('Creating Users...');
    const defaultPassword = await bcrypt.hash('password123', 12);
    
    const users = [
      { email: 'admin@cms.com', name: 'System Admin', password: defaultPassword, role: 'ADMIN' },
      { email: 'it.staff@cms.com', name: 'IT Staff Member', password: defaultPassword, role: 'STAFF', departmentId: itDept?.id },
      { email: 'infra.staff@cms.com', name: 'Infra Staff Member', password: defaultPassword, role: 'STAFF', departmentId: infraDept?.id },
      { email: 'user@cms.com', name: 'Standard User', password: defaultPassword, role: 'USER' },
    ];

    for (const user of users) {
      const { data: existing } = await supabase.from('users').select('id').eq('email', user.email).maybeSingle();
      if (!existing) {
        await supabase.from('users').insert(user);
      }
    }

    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
