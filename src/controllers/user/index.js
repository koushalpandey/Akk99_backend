import productController from './product.controller.js';
import reviewController from './review.controller.js';
import authController from './userAuth.controller.js';

import DashboardproductController from './dashboard.controller.js';
import UserDetailController from './userdetail.controller.js';

export default {
    auth: authController,
    product: productController,
    review: reviewController,
    dashboard: DashboardproductController,
    userDetail: UserDetailController
};