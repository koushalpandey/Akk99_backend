import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const adminService = {
  // Admin sign in
  async adminSignIn(email, password) {
    // Find admin user
    const admin = await prisma.user.findFirst({
      where: {
        email: email,
        role: 'admin',
        isActive: true
      }
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    // Check password (if hashed)
    let isPasswordValid = false;
    if (admin.password) {
      isPasswordValid = await bcrypt.compare(password, admin.password);
    } else {
      // For seeded admins with plain text password
      isPasswordValid = (password === admin.password);
    }

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email, 
        role: admin.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    await prisma.session.create({
      data: {
        userId: admin.id,
        token,
        refreshToken: token,
        expiresAt
      }
    });

    // Return admin data without sensitive info
    const { password: _, ...adminWithoutPassword } = admin;

    return {
      admin: adminWithoutPassword,
      token
    };
  },

  // Verify admin token
  async verifyAdminToken(token) {
    const session = await prisma.session.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
        isRevoked: false
      },
      include: {
        user: {
          where: { role: 'admin' }
        }
      }
    });

    if (!session || !session.user) {
      throw new Error('Invalid or expired token');
    }

    return session.user;
  },

  // Admin logout
  async adminLogout(token) {
    await prisma.session.updateMany({
      where: { token },
      data: { isRevoked: true }
    });
  }
};

export default adminService;