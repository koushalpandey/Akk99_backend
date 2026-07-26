import express from 'express';
import WishListController from '../../controllers/user/index.js';


const router = express.Router();

router.post('/add', WishListController.wishlist.addWishlist)
router.get('/get', WishListController.wishlist.getWishListController)
router.post('/delete', WishListController.wishlist.deleteWishListController)





export default router