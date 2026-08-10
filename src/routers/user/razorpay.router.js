import { Router } from "express";
import RazorpayController from "./../../controllers/user-paymentGateway/index.js";


const router = Router()



router.post('/create', RazorpayController.Order.createOrderController)
router.post('/verify', RazorpayController.Order.verifyOrderController)
router.get('/order-status', RazorpayController.Order.getOrderStatusController)


export default router