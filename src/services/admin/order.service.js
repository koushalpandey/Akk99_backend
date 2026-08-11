import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()


const OrderListService = {
    async GetAllUserOrderService() {

        try {
            const order = await prisma.order.findMany({
                orderBy: {
                    createdAt: "desc"
                },
                include: {
                    user: true
                }
            });
            return order
        } catch (error) {
            throw new Error(`Order list fetch failed: ${error.message}`);
        }

    }
}
export default OrderListService;