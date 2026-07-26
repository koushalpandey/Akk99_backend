import express from 'express';
import adminController from '../../controllers/admin/index.js';

const router = express.Router();

// Admin auth routes
router.post('/signin', adminController.auth.signIn);
router.post('/logout', adminController.auth.logout);
router.get('/verify', adminController.auth.verifyToken);

export default router;