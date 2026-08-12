import { Router } from "express";
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import UserDetailRoutes from "./userDetail.routes.js";
import razorpayRouter from "./razorpay.router.js";
import reviewRouter from './review.routes.js';






const router = Router();
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/profile", UserDetailRoutes);
router.use("/review", reviewRouter);
router.use("/order", razorpayRouter);



export default router;
