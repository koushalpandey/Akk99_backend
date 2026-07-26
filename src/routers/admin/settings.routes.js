import express from 'express';
import settingsController from '../../controllers/admin/index.js';
import { upload } from '../../middlewares/upload.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { isAdmin } from '../../middlewares/role.middleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(isAdmin);

// Settings Routes
router.get('/login-image', settingsController.setting.getLoginImage);
router.post('/login-image', upload.single('image'), settingsController.setting.updateLoginImage);
router.get('/all', settingsController.setting.getAllSettings);

export default router;