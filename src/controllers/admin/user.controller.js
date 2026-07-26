import userService from '../../services/admin/index.js';

class UserController {
  // Get all users
  async getUsers(req, res) {
    try {
      const users = await userService.user.getUsers(req.query);
      
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get users'
      });
    }
  }

  // Get single user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.user.getUserById(id);
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get user'
      });
    }
  }

  // Block user
  async blockUser(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.user.blockUser(id);
      
      res.status(200).json({
        success: true,
        message: 'User blocked successfully',
        data: user
      });
    } catch (error) {
      console.error('Block user error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to block user'
      });
    }
  }

  // Unblock user
  async unblockUser(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.user.unblockUser(id);
      
      res.status(200).json({
        success: true,
        message: 'User unblocked successfully',
        data: user
      });
    } catch (error) {
      console.error('Unblock user error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to unblock user'
      });
    }
  }

  // Bulk block users
  async bulkBlockUsers(req, res) {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Please provide valid user IDs'
        });
      }
      
      const result = await userService.user.bulkBlockUsers(ids);
      
      res.status(200).json({
        success: true,
        message: `${result.count} user(s) blocked successfully`,
        data: result
      });
    } catch (error) {
      console.error('Bulk block users error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to block users'
      });
    }
  }

  // Bulk unblock users
  async bulkUnblockUsers(req, res) {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Please provide valid user IDs'
        });
      }
      
      const result = await userService.user.bulkUnblockUsers(ids);
      
      res.status(200).json({
        success: true,
        message: `${result.count} user(s) unblocked successfully`,
        data: result
      });
    } catch (error) {
      console.error('Bulk unblock users error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to unblock users'
      });
    }
  }

  // Get user statistics
  async getUserStats(req, res) {
    try {
      const stats = await userService.user.getUserStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get user statistics'
      });
    }
  }
}

export default new UserController();