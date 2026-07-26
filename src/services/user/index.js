import DashbaordProductService from './dashboard.service.js';
import productService from './product.service.js';
import reviewService from './review.service.js';
import authService from './userAuth.service.js';
import wishListService from './wishlist.service.js'

export default {
    auth: authService,
    product: productService,
    wishList: wishListService,
    reviwe: reviewService,
    dashbboard: DashbaordProductService
}