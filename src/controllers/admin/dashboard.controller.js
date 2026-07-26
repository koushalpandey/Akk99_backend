import dashboardService from '../../services/admin/index.js';

class DashboardController {
  // Get main dashboard statistics
  async getDashboardStats(req, res) {
    try {
      const stats = await dashboardService.dashboard.getDashboardStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get dashboard statistics'
      });
    }
  }

  // Get sales chart data (last 30 days)
  async getSalesChartData(req, res) {
    try {
      const data = await  dashboardService.dashboard.getSalesChartData();
      
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Sales chart error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get sales chart data'
      });
    }
  }

  // Get category distribution
  async getCategoryDistribution(req, res) {
    try {
      const data = await  dashboardService.dashboard.getCategoryDistribution();
      
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Category distribution error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get category distribution'
      });
    }
  }

  // Get recent activity
  async getRecentActivity(req, res) {
    try {
      const data = await  dashboardService.dashboard.getRecentActivity();
      
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Recent activity error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get recent activity'
      });
    }
  }

  // Get order status distribution
  async getOrderStatusDistribution(req, res) {
    try {
      const data = await  dashboardService.dashboard.getOrderStatusDistribution();
      
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Order status error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get order status distribution'
      });
    }
  }

  // Get monthly revenue
  async getMonthlyRevenue(req, res) {
    try {
      const data = await  dashboardService.dashboard.getMonthlyRevenue();
      
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Monthly revenue error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get monthly revenue'
      });
    }
  }
}

export default new DashboardController();