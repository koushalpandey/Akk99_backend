import express from 'express';
import controllers from '../../controllers/user/index.js';
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/login-google', controllers.auth.loginWithGoogle)
router.get('/me', authMiddleware, controllers.auth.getCurrentUser);
router.get('/logout', controllers.auth.logout);
router.post('/logout-all', controllers.auth.logoutAllDevices);
router.post('/refresh-token', controllers.auth.refreshToken);
router.get('/status', controllers.auth.checkAuthStatus);


export default router;