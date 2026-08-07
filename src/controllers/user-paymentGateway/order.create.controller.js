import orderService from "../../services/user-paymentGateway-service/index.js"

const RazorpayOrderController = {

    async createOrderController(req, res) {
        const { userId, productId } = req.body;
        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: "Bad request : Invalid payload"
            })

        }

        try {
            const OrderCreateResponse = await orderService.Order.CreateOrderService(userId, productId)
            return res.status(201).json({
                message: "Order Created",
                status: true,
                // data: OrderCreateResponse,
                // key: process.env.RAZORPAY_APIKEY
            })

        }
        catch (error) {
            return res.status(500).json({
                message: "Something went worng",
                error: error.message
            })
        }
    },


    async verifyOrderController(req, res) {

    },


}


export default RazorpayOrderController