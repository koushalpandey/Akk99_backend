import express from 'express';
import dashboardController from '../../controllers/admin/index.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { isAdmin } from '../../middlewares/role.middleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(isAdmin);

// Dashboard routes
router.get('/stats', dashboardController.dashboard.getDashboardStats);
router.get('/sales-chart', dashboardController.dashboard.getSalesChartData);
router.get('/category-distribution', dashboardController.dashboard.getCategoryDistribution);
router.get('/recent-activity', dashboardController.dashboard.getRecentActivity);
router.get('/order-status', dashboardController.dashboard.getOrderStatusDistribution);
router.get('/monthly-revenue', dashboardController.dashboard.getMonthlyRevenue);

export default router;