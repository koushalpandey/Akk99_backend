import wishlistService from '../../services/user/index.js'

const WishListController = {

    async addWishlist(req, res) {
        try {
            const { userId, productId } = req.body;
            if (!userId || !productId) {
                return res.status(400).json({
                    success: false,
                    message: "userId and productId are required"
                });
            }
            const wishlist = await wishlistService.wishList.addWhisListService(userId, productId);
            return res.status(201).json({
                success: true,
                message: "Product added to wishlist successfully",
                data: wishlist
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });

        }

    },

    async getWishListController(req, res) {
        try {
            const  userId  = req.user.id;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "userId is required"
                });
            }
            const wishlist = await wishlistService.wishList.getWishlistService(userId);
            return res.status(200).json({
                success: true,
                message: "Wishlist fetched successfully",
                data: wishlist
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    async deleteWishListController(req, res) {
        try {
            const { id, userId, productId } = req.body;
            if (!id || userId || !productId) {
                return res.status(400).json({
                    success: false,
                    message: "userId and productId are required"
                });
            }
            await wishlistService.wishList.deleteWhisListService(id, userId, productId);
            return res.status(201).json({
                success: true,
                message: "Product deleted from wishlist successfully",

            });

        } catch (error) {
            console.log("error form  wishlist deleteController", error.message)
            return res.status(500).json({
                success: false,
                message: error.message
            });

        }


    },


}

export default WishListController