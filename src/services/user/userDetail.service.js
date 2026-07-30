import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UserDetailService = {

    async createUserDetail(userId, data) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error("User not found");
        }

        const existingDetail = await prisma.userDetail.findUnique({
            where: { userId }
        });

        if (existingDetail) {
            throw new Error("User detail already exists. Use update endpoint instead.");
        }

        const userDetail = await prisma.userDetail.create({
            data: {
                userId,
                phoneNumber: data.phoneNumber,
                address: data.address,
                city: data.city,
                state: data.state,
                pincode: data.pincode,
                gender: data.gender
            }
        });

        return userDetail;
    },

    async getUserDetail(userId) {
        const userDetail = await prisma.userDetail.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        picture: true
                    }
                }
            }
        });

        return userDetail;
    },

    async updateUserDetail(userId, data) {

        const existingDetail = await prisma.userDetail.findUnique({
            where: { userId }
        });

        if (!existingDetail) {
            throw new Error('User detail not found. Create a new one first.');
        }

        const updatedDetail = await prisma.userDetail.update({
            where: { userId },
            data: {
                phoneNumber: data.phoneNumber,
                address: data.address,
                gender: data.gender
            }
        });

        return updatedDetail;
    },


    async getOrCreateUserDetail(userId) {
        const existingDetail = await prisma.userDetail.findUnique({
            where: { userId }
        });

        if (existingDetail) {
            return existingDetail;
        }

        return await prisma.userDetail.create({
            data: {
                userId
            }
        });
    },


    async deleteUserDetail(userId) {
        const existingDetail = await prisma.userDetail.findUnique({
            where: { userId }
        });

        if (!existingDetail) {
            throw new Error('User detail not found');
        }

        await prisma.userDetail.delete({
            where: { userId }
        });
    },


    async userDetailExists(userId) {
        const detail = await prisma.userDetail.findUnique({
            where: { userId }
        });
        return !!detail;
    }
}

export default UserDetailService;