import express from 'express';
import categoryController from '../../controllers/admin/index.js';
import { upload } from '../../middlewares/upload.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { isAdmin } from '../../middlewares/role.middleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(isAdmin);

// Category CRUD routes
router.post('/create', upload.single('image'), categoryController.category.createCategory);
router.put('/update/:id', upload.single('image'), categoryController.category.updateCategory);
router.delete('/delete/:id', categoryController.category.deleteCategory);
router.get('/details/:id', categoryController.category.getCategory);
router.get('/list', categoryController.category.getCategories);
router.get('/tree/all', categoryController.category.getCategoryTree);
router.get('/slug/:slug', categoryController.category.getCategoryBySlug);

export default router;