import { Router } from "express";
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import wishlistRoutes from "./wishlist.routes.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import reviewRouter from './review.routes.js'



const router = Router();
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/wishlist", authMiddleware, wishlistRoutes);
router.use("/review", authMiddleware, reviewRouter);


export default router;
