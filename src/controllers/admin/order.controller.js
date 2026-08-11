import OrderService from "../../services/admin/index.js";


const OrderListController = {
    async OrderListController(req, res) {
        try {
            const order = await OrderService.userorder.GetAllUserOrderService();
            return res.status(200).json({
                success: true,
                data: order
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

export default OrderListController;