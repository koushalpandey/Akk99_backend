import { Router } from "express";
import OrderController from "../../controllers/admin/index.js"


const router = Router()


router.get("/list", OrderController.order.OrderListController)

export default router