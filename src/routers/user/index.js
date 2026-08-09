import { Router } from "express";
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import UserDetailRoutes from "./userDetail.routes.js";
import razorpayRouter from "./razorpay.router.js";
import reviewRouter from './review.routes.js';

import { authMiddleware } from "../../middlewares/auth.middleware.js";




const router = Router();
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/profile", UserDetailRoutes);
router.use("/review", authMiddleware, reviewRouter);
router.use("/order", authMiddleware, razorpayRouter);



export default router;
