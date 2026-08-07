import { Router } from "express";
import razorpayRouter from './razorpay.router.js'

const router = Router()


router.use('/order', razorpayRouter)

export default router