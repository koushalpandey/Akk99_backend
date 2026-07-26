import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class UserService {
  // Get all users with filters and pagination
  async getUsers(filters) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const where = {};

    // Search by name or email
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filter by role
    if (role && role !== '') {
      where.role = role;
    }

    // Filter by status
    if (isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
          provider: true,
          role: true,
          isActive: true,
          emailVerified: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  // Get single user by ID
  async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        picture: true,
        provider: true,
        role: true,
        isActive: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
            sessions: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Block user (set isActive to false)
  async blockUser(id) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'admin') {
      throw new Error('Cannot block admin users');
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        updatedAt: true
      }
    });

    // Revoke all sessions of blocked user
    await prisma.session.updateMany({
      where: { userId: parseInt(id) },
      data: { isRevoked: true }
    });

    return updatedUser;
  }

  // Unblock user (set isActive to true)
  async unblockUser(id) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        updatedAt: true
      }
    });

    return updatedUser;
  }

  // Block multiple users
  async bulkBlockUsers(ids) {
    const users = await prisma.user.updateMany({
      where: {
        id: { in: ids.map(id => parseInt(id)) },
        role: { not: 'admin' }
      },
      data: { isActive: false }
    });

    // Revoke sessions of blocked users
    await prisma.session.updateMany({
      where: { userId: { in: ids.map(id => parseInt(id)) } },
      data: { isRevoked: true }
    });

    return { count: users.count };
  }

  // Unblock multiple users
  async bulkUnblockUsers(ids) {
    const users = await prisma.user.updateMany({
      where: {
        id: { in: ids.map(id => parseInt(id)) },
        role: { not: 'admin' }
      },
      data: { isActive: true }
    });

    return { count: users.count };
  }

  // Get user statistics for dashboard
  async getUserStats() {
    const [totalUsers, activeUsers, blockedUsers, adminCount, userCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.user.count({ where: { role: 'user' } })
    ]);

    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsersThisWeek = await prisma.user.count({
      where: {
        createdAt: { gte: sevenDaysAgo }
      }
    });

    return {
      totalUsers,
      activeUsers,
      blockedUsers,
      adminCount,
      userCount,
      newUsersThisWeek
    };
  }
}

export default new UserService();