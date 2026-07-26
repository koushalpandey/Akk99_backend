import express from 'express';
import brandController from '../../controllers/admin/index.js';
import { upload } from '../../middlewares/upload.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { isAdmin } from '../../middlewares/role.middleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(isAdmin);

// Brand CRUD routes
router.post('/create', upload.single('logo'), brandController.brand.createBrand);
router.put('/update/:id', upload.single('logo'), brandController.brand.updateBrand);
router.delete('/delete/:id', brandController.brand.deleteBrand);
router.get('/details/:id', brandController.brand.getBrand);
router.get('/list', brandController.brand.getBrands);
router.patch('/:id/status', brandController.brand.updateStatus);

export default router;