import express from 'express';
import productController from '../../controllers/user/index.js';

const router = express.Router();

// Public routes
router.get('/dashboard', productController.dashboard.dashbaordController)
router.get('/list', productController.product.getAllProducts);
router.get('/search', productController.product.searchProducts);
router.get('/featured', productController.product.getFeaturedProducts);
router.get('/categories', productController.product.getAllCategories);
router.get('/categories/:slug', productController.product.getCategoryBySlug);
router.get('/categories/:slug/products', productController.product.getProductsByCategory);
router.get('/brands', productController.product.getAllBrands);
router.get('/slug/:slug', productController.product.getProductBySlug);
router.get('/slider', productController.product.getSlider);
router.get('/:id', productController.product.getProductById);
router.get('/:id/reviews', productController.product.getProductReviews);

export default router;