import authService from './admin.service.js';
import productService from './product.service.js';
import brandService from './brand.service.js';
import categoryService from './category.service.js';
import userService from './user.service.js';
import dashboardService from './dashboard.service.js';
import sliderService from './slider.service.js';
import offerService from './offer.service.js';
import settingService from './settings.service.js';

export default {
    auth : authService,
    product: productService,
    brand: brandService,
    category: categoryService,
    user: userService,
    dashboard: dashboardService,
    setting: settingService,
    offer: offerService,
    slider: sliderService
   
}