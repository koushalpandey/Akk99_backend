import DashbaordProductService from './dashboard.service.js';
import productService from './product.service.js';
import reviewService from './review.service.js';
import authService from './userAuth.service.js';
import userDetailService from './userDetail.service.js';


export default {
    auth: authService,
    product: productService,
    reviwe: reviewService,
    dashbboard: DashbaordProductService,
    userDetail: userDetailService,
}