import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Adding more sample data...');

  try {
    // 1. New Departments
    const departments = [
      { name: 'Marketing', description: 'Handles marketing and external comms' },
      { name: 'Finance', description: 'Handles payroll, budgets, and expenses' },
      { name: 'Legal', description: 'Handles compliance and legal matters' },
    ];
    
    for (const dept of departments) {
      await prisma.department.upsert({
        where: { name: dept.name },
        update: {},
        create: dept,
      });
    }

    const financeDept = await prisma.department.findUnique({ where: { name: 'Finance' } });
    const marketingDept = await prisma.department.findUnique({ where: { name: 'Marketing' } });
    const legalDept = await prisma.department.findUnique({ where: { name: 'Legal' } });

    // 2. New Categories
    const categories = [
      { name: 'Payroll', description: 'Salary and expense reimbursement', icon: 'dollar-sign' },
      { name: 'General', description: 'General inquiries', icon: 'info' },
      { name: 'Policy', description: 'HR and Legal policy clarification', icon: 'file-text' },
      { name: 'Equipment', description: 'Office supplies and furniture', icon: 'briefcase' },
    ];

    for (const cat of categories) {
      await prisma.category.upsert({
        where: { name: cat.name },
        update: {},
        create: cat,
      });
    }

    // 3. New Users
    const defaultPassword = await bcrypt.hash('password123', 12);
    
    const users = [
      // Staff
      { email: 'finance.staff@cms.com', name: 'Finance Staff', password: defaultPassword, role: 'STAFF', departmentId: financeDept?.id },
      { email: 'marketing.staff@cms.com', name: 'Marketing Staff', password: defaultPassword, role: 'STAFF', departmentId: marketingDept?.id },
      { email: 'legal.staff@cms.com', name: 'Legal Staff', password: defaultPassword, role: 'STAFF', departmentId: legalDept?.id },
      // Regular Users
      { email: 'user2@cms.com', name: 'Alice Smith', password: defaultPassword, role: 'USER' },
      { email: 'user3@cms.com', name: 'Bob Jones', password: defaultPassword, role: 'USER' },
      { email: 'user4@cms.com', name: 'Charlie Brown', password: defaultPassword, role: 'USER' },
    ];

    for (const user of users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          email: user.email,
          name: user.name,
          password: user.password,
          role: user.role as any,
          departmentId: user.departmentId,
        },
      });
    }

    // 4. Create some complaints for the new users
    const categoryPayroll = await prisma.category.findUnique({ where: { name: 'Payroll' } });
    const categoryEquipment = await prisma.category.findUnique({ where: { name: 'Equipment' } });
    const alice = await prisma.user.findUnique({ where: { email: 'user2@cms.com' } });
    const bob = await prisma.user.findUnique({ where: { email: 'user3@cms.com' } });

    if (alice && categoryPayroll) {
      await prisma.complaint.create({
        data: {
          title: 'Missing overtime pay',
          description: 'My overtime from last month is missing from my payslip.',
          status: 'PENDING',
          priority: 'HIGH',
          categoryId: categoryPayroll.id,
          userId: alice.id,
        }
      });
    }

    if (bob && categoryEquipment) {
      await prisma.complaint.create({
        data: {
          title: 'Need new office chair',
          description: 'My chair is broken and hurting my back.',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          categoryId: categoryEquipment.id,
          userId: bob.id,
        }
      });
    }

    console.log('✅ New sample data added successfully!');
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
