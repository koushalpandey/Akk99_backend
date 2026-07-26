import adminService from '../../services/admin/index.js';

const adminController = {
  // Admin sign in
  async signIn(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const result = await adminService.auth.adminSignIn(email, password);

      res.status(200).json({
        success: true,
        message: 'Admin sign in successful',
        data: result
      });
    } catch (error) {
      console.error('Admin sign in error:', error);
      
      if (error.message === 'Admin not found' || error.message === 'Invalid credentials') {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Verify admin token
  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Token required'
        });
      }

      const admin = await adminService.auth.verifyAdminToken(token);

      res.status(200).json({
        success: true,
        data: { admin }
      });
    } catch (error) {
      console.error('Verify token error:', error);
      res.status(401).json({
        success: false,
        error: error.message || 'Invalid token'
      });
    }
  },

  // Admin logout
  async logout(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (token) {
        await adminService.auth.adminLogout(token);
      }

      res.status(200).json({
        success: true,
        message: 'Admin logged out successfully'
      });
    } catch (error) {
      console.error('Admin logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
};

export default adminController;