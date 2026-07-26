import productController from './product.controller.js';
import reviewController from './review.controller.js';
import authController from './userAuth.controller.js';
import WishListController from './wishlist.controller.js';
import DashboardproductController from './dashboard.controller.js';

export default {
    auth: authController,
    product: productController,
    wishlist: WishListController,
    review: reviewController,
    dashboard: DashboardproductController
};