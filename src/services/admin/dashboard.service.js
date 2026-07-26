import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class DashboardService {
  // Get main dashboard statistics
  async getDashboardStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get all counts
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      lowStockProducts,
      publishedProducts,
      draftProducts,
      outOfStockProducts,
      activeUsers,
      blockedUsers,
      todayOrders,
      todayRevenue,
      weekOrders,
      weekRevenue,
      monthOrders,
      monthRevenue,
      topProducts,
      recentOrders
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total products
      prisma.product.count(),
      
      // Total orders
      prisma.order.count(),
      
      // Total revenue
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { total: true }
      }),
      
      // Pending orders
      prisma.order.count({ where: { status: 'PENDING' } }),
      
      // Processing orders
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      
      // Delivered orders
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      
      // Cancelled orders
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      
      // Low stock products (quantity <= 10)
      prisma.product.count({ where: { quantity: { lte: 10 }, trackQuantity: true } }),
      
      // Published products
      prisma.product.count({ where: { status: 'PUBLISHED' } }),
      
      // Draft products
      prisma.product.count({ where: { status: 'DRAFT' } }),
      
      // Out of stock products
      prisma.product.count({ where: { quantity: 0, trackQuantity: true } }),
      
      // Active users
      prisma.user.count({ where: { isActive: true } }),
      
      // Blocked users
      prisma.user.count({ where: { isActive: false } }),
      
      // Today's orders
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      
      // Today's revenue
      prisma.order.aggregate({
        where: { 
          paymentStatus: 'PAID',
          createdAt: { gte: startOfToday }
        },
        _sum: { total: true }
      }),
      
      // This week's orders
      prisma.order.count({ where: { createdAt: { gte: startOfWeek } } }),
      
      // This week's revenue
      prisma.order.aggregate({
        where: { 
          paymentStatus: 'PAID',
          createdAt: { gte: startOfWeek }
        },
        _sum: { total: true }
      }),
      
      // This month's orders
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      
      // This month's revenue
      prisma.order.aggregate({
        where: { 
          paymentStatus: 'PAID',
          createdAt: { gte: startOfMonth }
        },
        _sum: { total: true }
      }),
      
      // Top 5 products by sales
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),
      
      // Recent 10 orders
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              picture: true
            }
          },
          items: {
            take: 3,
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true
                }
              }
            }
          }
        }
      })
    ]);

    // Get top products details
    const topProductsDetails = [];
    for (const item of topProducts) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          sku: true
        }
      });
      if (product) {
        topProductsDetails.push({
          ...product,
          totalSold: item._sum.quantity || 0,
          revenue: (product.price || 0) * (item._sum.quantity || 0)
        });
      }
    }

    return {
      summary: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        cancelledOrders,
        lowStockProducts,
        publishedProducts,
        draftProducts,
        outOfStockProducts,
        activeUsers,
        blockedUsers
      },
      today: {
        orders: todayOrders,
        revenue: todayRevenue._sum.total || 0
      },
      week: {
        orders: weekOrders,
        revenue: weekRevenue._sum.total || 0
      },
      month: {
        orders: monthOrders,
        revenue: monthRevenue._sum.total || 0
      },
      topProducts: topProductsDetails,
      recentOrders
    };
  }

  // Get sales data for charts (last 30 days)
  async getSalesChartData() {
    const last30Days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      const [orders, revenue] = await Promise.all([
        prisma.order.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        }),
        prisma.order.aggregate({
          where: {
            paymentStatus: 'PAID',
            createdAt: {
              gte: date,
              lt: nextDate
            }
          },
          _sum: { total: true }
        })
      ]);
      
      last30Days.push({
        date: date.toISOString().split('T')[0],
        orders,
        revenue: revenue._sum.total || 0,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    
    return last30Days;
  }

  // Get category wise product distribution
  async getCategoryDistribution() {
    const categories = await prisma.category.findMany({
      where: {
        products: {
          some: {}
        }
      },
      include: {
        _count: {
          select: { products: true }
        }
      },
      take: 10
    });
    
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      productCount: cat._count.products,
      slug: cat.slug
    }));
  }

  // Get recent activity logs
  async getRecentActivity() {
    const activities = [];
    
    // Get recent users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });
    
    recentUsers.forEach(user => {
      activities.push({
        id: user.id,
        type: 'user',
        action: 'New user registered',
        user: user.name,
        email: user.email,
        time: user.createdAt,
        icon: 'user-plus',
        color: 'green'
      });
    });
    
    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true }
        }
      }
    });
    
    recentOrders.forEach(order => {
      activities.push({
        id: order.id,
        type: 'order',
        action: `New order #${order.orderNumber}`,
        user: order.user?.name || 'Guest',
        amount: order.total,
        time: order.createdAt,
        icon: 'shopping-cart',
        color: 'blue'
      });
    });
    
    // Sort by time and take latest 10
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    
    return activities.slice(0, 10);
  }

  // Get order status distribution
  async getOrderStatusDistribution() {
    const statuses = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    
    const statusMap = {
      PENDING: 'Pending',
      PROCESSING: 'Processing',
      CONFIRMED: 'Confirmed',
      SHIPPED: 'Shipped',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled',
      REFUNDED: 'Refunded'
    };
    
    return statuses.map(item => ({
      status: item.status,
      label: statusMap[item.status] || item.status,
      count: item._count.status
    }));
  }

  // Get monthly revenue for last 12 months
  async getMonthlyRevenue() {
    const monthlyData = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
      
      const revenue = await prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: {
            gte: date,
            lt: nextMonth
          }
        },
        _sum: { total: true }
      });
      
      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: revenue._sum.total || 0,
        year: date.getFullYear(),
        monthNumber: date.getMonth()
      });
    }
    
    return monthlyData;
  }
}

export default new DashboardService();