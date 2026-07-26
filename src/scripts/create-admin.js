import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('Admin@1234', 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@ak99.in' },
      update: {},
      create: {
        name: 'Super Admin',
        email: 'admin@ak99.in',
        password: hashedPassword,
        role: 'admin',
        provider: 'email',
        isActive: true,
        emailVerified: true
      }
    });

    console.log('Admin user created:', admin.email);
    console.log('Password: Admin@123');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();