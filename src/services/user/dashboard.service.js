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
            const sliders = await prisma.slider.findMany({
                where: { isActive: true },
                select: {
                    image: true,
                    link: true
                }
            })
            sliders.forEach(slider => {
                if (slider.image) {
                    slider.image = JSON.parse(slider.image);
                }
            });
            const categoriesData = await prisma.category.findMany({
                where: {
                    parentId: null
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    image: true,
                }
            })
            categoriesData.forEach(cat => {
                if (cat.image) {
                    cat.image = JSON.parse(cat.image);
                }
            });
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
                sliders,
                categoriesData,
                electronic,
                testing,
            };
        } catch (error) {
            throw error;
        }

    }
}



export default DashbaordProductService