import authController from './admin.controller.js';
import categoryController from './category.controller.js';
import productController from './product.controller.js';
import brandController from './brand.controller.js';
import userController from './user.controller.js';
import dashboardController from './dashboard.controller.js';
import settingController from './settings.controller.js';
import sliderController from './slider.controller.js';
import offersController from './offer.controller.js';
import OrderListController from './order.controller.js';


export default {
    auth: authController,
    product: productController,
    brand: brandController,
    category: categoryController,
    user: userController,
    dashboard: dashboardController,
    setting: settingController,
    slider: sliderController,
    offer: offersController,
    order: OrderListController

};