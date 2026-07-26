import express from 'express';
import productController from '../../controllers/admin/index.js';
import { upload } from '../../middlewares/upload.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Product CRUD routes
router.post(
  '/create',
  upload.array('images', 10),
  productController.product.createProduct
);

router.put(
  '/update/:id',
  upload.array('images', 10),
  productController.product.updateProduct
);

router.delete('/products/:id', productController.product.deleteProduct);
router.get('/details/:id', productController.product.getProduct);
router.get('/list', productController.product.getProducts);
router.patch('/update/:id/stock', productController.product.updateStock);

export default router;