import { PrismaClient } from '@prisma/client';
import redisClient from '../../utils/redis.js';

const prisma = new PrismaClient();
const DASHBOARD_CACHE_KEY = "dashboard:data";

const DashbaordProductService = {
    async DashbaordService() {
        const cache = await redisClient.get(DASHBOARD_CACHE_KEY);
        if (cache) {
            console.log("✅ Dashboard from Redis");
            return JSON.parse(cache);
        }
        console.log("📦 Dashboard from Database");
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

            const result = {
                sliders,
                categoriesData,
                electronic,
                testing,
            };
            await redisClient.set(DASHBOARD_CACHE_KEY, JSON.stringify(result),
                {
                    EX: 300
                }
            );
            return result;

        } catch (error) {
            throw error;
        }

    }
}



export default DashbaordProductService