import express from 'express';
import userController from '../../controllers/admin/index.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { isAdmin } from '../../middlewares/role.middleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(isAdmin); // Only admins can access user management

// User management routes
router.get('/list', userController.user.getUsers);
router.get('/stats', userController.user.getUserStats);
router.get('/details/:id', userController.user.getUserById);
router.patch('/:id/block', userController.user.blockUser);
router.patch('/:id/unblock', userController.user.unblockUser);
router.post('/bulk-block', userController.user.bulkBlockUsers);
router.post('/bulk-unblock', userController.user.bulkUnblockUsers);

export default router;