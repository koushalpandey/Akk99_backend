import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


const DashbaordProductService = {
    async DashbaordService() {
        const specificData = {
            id: true,
            name: true,
            slug: true,
            price: true,
            comparePrice: true,
            images: true,
        }

        try {
            const [electronic, testing] = await Promise.all([
                prisma.product.findMany({
                    where: {
                        category: {
                            slug: "electronics",
                        },
                        status: "PUBLISHED",
                    },
                    select: specificData,
                    take: 8,
                }),

                prisma.product.findMany({
                    where: {
                        category: {
                            slug: "testing",
                        },
                        status: "PUBLISHED",
                    },
                    select: specificData,
                    take: 8,
                }),
            ]);

            return {
                electronic,
                testing,
            };
        } catch (error) {
            throw error;
        }

    }
}



export default DashbaordProductService