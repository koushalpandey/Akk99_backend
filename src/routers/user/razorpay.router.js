import { Router } from "express";
import RazorpayController from "./../../controllers/user-paymentGateway/index.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";


const router = Router()
router.use(authMiddleware)

// Razorpay Order Creat routes
router.post('/create', RazorpayController.Order.createOrderController)
router.post('/verify', RazorpayController.Order.verifyOrderController)
router.get('/status', RazorpayController.Order.getOrderStatusController)



// Get user Orderlist
router.get('/list', RazorpayController.Order.getOderListController)


export default router