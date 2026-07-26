import { Router } from "express";
import authRoutes from "./admin.routes.js";
import productRoutes from "./product.routes.js";
import brandRoutes from "./brand.routes.js";
import categoriesRoutes from "./category.routes.js";
import userRoutes from "./user.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import settingRoutes from "./settings.routes.js";
import offersRoutes from "./offer.routes.js";
import sliderRoutes from "./slider.routes.js";



const router = Router();
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/brands", brandRoutes);
router.use("/categories", categoriesRoutes);
router.use("/users", userRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/settings", settingRoutes);
router.use("/offers", offersRoutes);
router.use("/sliders", sliderRoutes);



export default router;
