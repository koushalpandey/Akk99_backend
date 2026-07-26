import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const reviewService = {
  async reviewCreateService(data) {
    try {
      const { userId, productId, rating, comment } = data;

      const [user, product] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { id: true },
        }),
        prisma.product.findUnique({
          where: { id: productId },
          select: {
            id: true
         },
        }),
      ]);

      if (!user) {
        throw new Error("User not found");
      }

      if (!product) {
        throw new Error("Product not found");
      }

      const result = await prisma.$transaction(async (tx) => {
        const review = await tx.review.create({
          data: {
            userId,
            productId,
            rating,
            comment: comment?.trim() || null,
          },
        });

        const reviewStats = await prisma.review.aggregate({
          where: {
            productId,
            isApproved: true,
          },
          _avg: {
            rating: true,
          },
          _count: {
            rating: true,
          },
        });

        const result = {
          averageRating: Number((reviewStats._avg.rating ?? 0).toFixed(1)),
          reviewCount: reviewStats._count.rating,
        };

        return review;
      });

      return {
        success: true,
        message: "Review created successfully",
        data: result,
      };
    } catch (error) {
      console.error("Review Create Service Error:", error);

      return {
        success: false,
        message: error.message || "Failed to create review",
      };
    }
  },
};

export default reviewService;
