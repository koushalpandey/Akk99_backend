import { PrismaClient } from "@prisma/client";
import razorpay from "../../config/razorpayConfig.js";
const prisma = new PrismaClient();

const RazorpayOrderService = {
    async CreateOrderService(userId, productId, addressData) {
        try {
            const product = await prisma.product.findUnique({
                where: { id: parseInt(productId) },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    quantity: true,
                    status: true
                }
            });

            if (!product) {
                throw new Error("Product not found");
            }

            if (product.quantity < 1) {
                throw new Error("Product is out of stock");
            }

            if (product.status !== "PUBLISHED") {
                throw new Error("Product is not available for purchase");
            }


            const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const order = await prisma.order.create({
                data: {
                    orderNumber: orderNumber,
                    userId: parseInt(userId),
                    status: "PENDING",
                    paymentStatus: "UNPAID",
                    shippingAddress: addressData,
                    billingAddress: addressData,
                    subtotal: product.price,
                    discount: 0,
                    tax: 0,
                    shippingCost: 0,
                    total: product.price,
                    items: {
                        create: {
                            productId: parseInt(productId),
                            quantity: 1,
                            price: product.price,
                            total: product.price
                        }
                    }
                },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });


            const razorpayOrder = await razorpay.orders.create({
                amount: Math.round(product.price * 100),
                currency: "INR",
                receipt: orderNumber,
                notes: {
                    orderId: order.id.toString(),
                    productName: product.name,
                    userId: userId.toString()
                }
            });


            const updatedOrder = await prisma.order.update({
                where: { id: order.id },
                data: {

                    razorpayOrderId: razorpayOrder.id
                }
            });

            return {
                order: updatedOrder,
                razorpayOrder: {
                    id: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    receipt: razorpayOrder.receipt
                },
                key_id: process.env.RAZORPAY_APIKEY
            };

        } catch (error) {
            throw new Error(`Order creation failed: ${error.message}`);
        }
    },

    async VerifyPaymentService(paymentData) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = paymentData;


            const crypto = await import('crypto');
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_SECRET)
                .update(body)
                .digest("hex");

            const isAuthentic = expectedSignature === razorpay_signature;

            if (!isAuthentic) {
                throw new Error("Payment verification failed - Invalid signature");
            }


            const order = await prisma.order.update({
                where: {
                    id: parseInt(orderId)
                },
                data: {
                    paymentStatus: "PAID",
                    status: "CONFIRMED",
                    paidAt: new Date(),
                    razorpayPaymentId: razorpay_payment_id
                },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });


            for (const item of order.items) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        quantity: {
                            decrement: item.quantity
                        }
                    }
                });
            }

            return {
                success: true,
                order,
                paymentId: razorpay_payment_id
            };

        } catch (error) {
            throw new Error(`Payment verification failed: ${error.message}`);
        }
    },

    async GetOrderStatusService(orderId) {
        try {
            const order = await prisma.order.findUnique({
                where: { id: parseInt(orderId) },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                    images: true,
                                    sku: true,
                                    slug: true,
                                    price: true,
                                    comparePrice: true,
                                    quantity: true,

                                }
                            },

                        }
                    },

                }
            });

            if (!order) {
                throw new Error("Order not found");
            }

            return order;

        } catch (error) {
            throw new Error(`Failed to get order status: ${error.message}`);
        }
    },

    async GetOrderListService(userId) {
        try {
            const order = await prisma.order.findMany({
                where: { userId: parseInt(userId) },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                    images: true,
                                    sku: true,
                                    slug: true,
                                    price: true,
                                    comparePrice: true,
                                    quantity: true,

                                }
                            },
                        }
                    },

                }
            });

            if (!order) {
                throw new Error("Order not found");
            }

            return order;

        } catch (error) {
            throw new Error(`Failed to get order list: ${error.message}`);
        }
    }
};

export default RazorpayOrderService;