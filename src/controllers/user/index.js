import productController from './product.controller.js';
import reviewController from './review.controller.js';
import authController from './userAuth.controller.js';

import DashboardproductController from './dashboard.controller.js';

export default {
    auth: authController,
    product: productController,
    review: reviewController,
    dashboard: DashboardproductController
};