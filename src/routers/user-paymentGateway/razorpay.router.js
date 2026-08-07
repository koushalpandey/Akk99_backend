import { Router } from "express";
import RazorpayController from "../../controllers/user-paymentGateway/index.js";


const router = Router()



router.post('/create', RazorpayController.Order.createOrderController)


export default router