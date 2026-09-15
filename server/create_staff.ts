import { supabase } from './src/lib/supabase';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Fetching departments...');
  const { data: departments, error: deptErr } = await supabase.from('departments').select('id, name');
  if (deptErr) throw deptErr;

  console.log('Fetching staff users...');
  const { data: staff, error: staffErr } = await supabase.from('users').select('departmentId').eq('role', 'STAFF');
  if (staffErr) throw staffErr;

  const departmentsWithStaff = new Set(staff.map(s => s.departmentId));

  for (const dept of departments) {
    if (!departmentsWithStaff.has(dept.id)) {
      console.log(`Creating staff for ${dept.name}...`);
      
      const emailName = dept.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const email = `${emailName}.staff@cms.com`;
      const name = `${dept.name} Staff`;
      const hashedPassword = await bcrypt.hash('password123', 12);

      const { data, error } = await supabase.from('users').insert({
        email,
        password: hashedPassword,
        name,
        role: 'STAFF',
        departmentId: dept.id,
        isActive: true
      }).select();

      if (error) {
        console.error(`Failed to create staff for ${dept.name}:`, error.message);
      } else {
        console.log(`Success: ${email} -> ${name}`);
      }
    } else {
      console.log(`Department ${dept.name} already has staff.`);
    }
  }
}

main().then(() => console.log('Done')).catch(console.error);
