import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const wishListService = {
  async addWhisListService(userId, productId) {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const alreadyExists = await prisma.wishlist.findFirst({
      where: {
        userId: Number(userId),
        productId: Number(productId),
      },
    });

    if (alreadyExists) {
      throw new Error("Product already exists in wishlist");
    }

    return await prisma.wishlist.create({
      data: {
        userId: Number(userId),
        productId: Number(productId),
      },
      include: {
        product: true,
      },
    });
  },

  async getWishlistService(userId, page = 1, limit = 10) {
    page = Number(page);
    limit = Number(limit);

    const skip = (page - 1) * limit;

    const [wishlist, total] = await prisma.$transaction([
      prisma.wishlist.findMany({
        where: {
          userId: Number(userId),
        },
        skip,
        take: limit,
        orderBy: {
          id: "desc",
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              comparePrice:true,
              images:true
            },
          },
        },
      }),

      prisma.wishlist.count({
        where: {
          userId: Number(userId),
        },
      }),
    ]);

    return {
      wishlist,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1,
      },
    };
  },

  async deleteWhisListService(id, userId, productId) {
    return await prisma.wishlist.delete({
      where: {
        id: Number(id),
        userId: Number(userId),
        productId: Number(productId),
      },
    });
  },
};

export default wishListService;
