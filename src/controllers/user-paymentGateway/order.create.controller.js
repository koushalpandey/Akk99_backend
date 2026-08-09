import orderService from "../../services/user-paymentGateway-service/index.js";

const RazorpayOrderController = {
    async createOrderController(req, res) {
        const userId = req.user.id;
        const { productId, address } = req.body;

        // Validation
        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: "Bad request: Invalid payload. userId and productId are required."
            });
        }

        if (!address || typeof address !== 'object') {
            return res.status(400).json({
                success: false,
                message: "Bad request: Address details are required."
            });
        }

        // Validate address fields
        const requiredFields = ['address', 'city', 'state', 'pincode', 'phoneNumber'];
        const missingFields = requiredFields.filter(field => !address[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required address fields: ${missingFields.join(', ')}`
            });
        }

        try {
            const response = await orderService.CreateOrderService(
                userId,
                productId,
                address
            );

            return res.status(201).json({
                success: true,
                message: "Order created successfully",
                data: {
                    order: response.order,
                    razorpayOrder: response.razorpayOrder,
                    key_id: response.key_id
                }
            });

        } catch (error) {
            console.error("Create Order Error:", error);
            return res.status(500).json({
                success: false,
                message: "Something went wrong while creating order",
                error: error.message
            });
        }
    },

    async verifyOrderController(req, res) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        // Validation
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
            return res.status(400).json({
                success: false,
                message: "Bad request: Missing payment verification data"
            });
        }

        try {
            const verificationResult = await orderService.VerifyPaymentService({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                orderId
            });

            return res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                data: verificationResult
            });

        } catch (error) {
            console.error("Verification Error:", error);

            // Mark order as failed if verification fails
            try {
                await prisma.order.update({
                    where: { id: parseInt(orderId) },
                    data: {
                        status: "CANCELLED",
                        cancelledAt: new Date()
                    }
                });
            } catch (updateError) {
                console.error("Failed to update order status:", updateError);
            }

            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
                error: error.message
            });
        }
    },

    async getOrderStatusController(req, res) {
        const { orderId } = req.params;
        const userId = req.user.id;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        try {
            const order = await orderService.GetOrderStatusService(orderId);

            // Check if order belongs to user
            if (order.userId !== parseInt(userId)) {
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to view this order"
                });
            }

            return res.status(200).json({
                success: true,
                data: order
            });

        } catch (error) {
            console.error("Get Order Status Error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to get order status",
                error: error.message
            });
        }
    }
};

export default RazorpayOrderController;