import { verifyOAuthToken } from '../../middlewares/auth.middleware.js';
import userServices from '../../services/user/index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const authController = {

  async loginWithGoogle(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Token not received"
        });
      }
      const verify = await verifyOAuthToken(token);

      if (!verify || !verify.email) {
        return res.status(401).json({
          success: false,
          message: "Invalid Google token"
        });
      }
      const user = await userServices.auth.findOrCreateGoogleUser(verify);
      const appToken = userServices.auth.generateToken(user.id, user.email);
      const refreshToken = userServices.auth.generateRefreshToken();
      await userServices.auth.createSession(user.id, appToken, refreshToken);

      return res.status(200).json({
        success: true,
        message: "Authentication successful",
        data: {
          token: appToken,
          refreshToken: refreshToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            picture: user.picture,
            role: user.role
          }
        }
      });

    } catch (error) {
      console.error('Error in loginWithGoogle:', error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
        error: error.message
      });
    }
  },

  // Get current user
  async getCurrentUser(req, res) {
    try {
      const userId = req.user?.id || req.session?.passport?.user;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      const user = await userServices.auth.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  //  this is an logout funtion will implement later with some changes  in code
  async logout(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (token) {
        await userServices.auth.revokeSession(token);
      }

      req.logout((err) => {
        if (err) console.error('Logout error:', err);
      });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  //  this is an AllDevice logout funtion will implement later with some changes  in code
  async logoutAllDevices(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      await userServices.auth.logoutAllDevices(userId);

      res.status(200).json({
        success: true,
        message: 'Logged out from all devices successfully'
      });
    } catch (error) {
      console.error('Logout all devices error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Refresh token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token required'
        });
      }

      const result = await userServices.auth.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        error: error.message || 'Invalid refresh token'
      });
    }
  },

  // Check auth status
  async checkAuthStatus(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          isAuthenticated: false
        });
      }

      const session = await userServices.auth.validateSession(token);

      if (!session) {
        return res.status(401).json({
          success: false,
          isAuthenticated: false
        });
      }

      const user = await userServices.auth.getUserById(session.userId);

      res.status(200).json({
        success: true,
        isAuthenticated: true,
        data: { user }
      });
    } catch (error) {
      console.error('Check auth status error:', error);
      res.status(500).json({
        success: false,
        isAuthenticated: false,
        error: 'Internal server error'
      });
    }
  }
};

export default authController;