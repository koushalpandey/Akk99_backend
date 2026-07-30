import UserDetailService from "../../services/user/index.js"

const UserDetailController = {
    async createUserAddress(req, res) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized - User not authenticated"
                });
            }

            const { phoneNumber, address, city, state, pincode, gender } = req.body;

            if (
                !phoneNumber ||
                !address ||
                !city ||
                !state ||
                !pincode ||
                !gender
            ) {
                return res.status(400).json({
                    success: false,
                    message: "At least one field is required."
                });
            }


            if (gender && !["MALE", "FEMALE"].includes(gender)) {
                return res.status(400).json({
                    success: false,
                    message: "Gender must be MALE or FEMALE."
                });
            }

            const userDetail = await UserDetailService.userDetail.createUserDetail(
                userId,
                {
                    phoneNumber,
                    address,
                    city,
                    state,
                    pincode,
                    gender
                }
            );

            return res.status(201).json({
                success: true,
                message: "User detail created successfully.",
                data: userDetail
            });

        } catch (error) {
            console.error("Error in createUserAddress:", error);

            if (error.message === "User not found") {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (
                error.message ===
                "User detail already exists. Use update endpoint instead."
            ) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    async getUserDetail(req, res) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized - User not authenticated'
                });
            }

            const userDetail = await UserDetailService.userDetail.getUserDetail(userId);

            if (!userDetail) {
                return res.status(404).json({
                    success: false,
                    message: 'User detail not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: userDetail
            });
        } catch (error) {
            console.error('Error in getUserDetail:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    },

    async updateUserDetail(req, res) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized - User not authenticated'
                });
            }

            const { phoneNumber, address, gender } = req.body;


            if (!phoneNumber && !address && !gender) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one field (phoneNumber, address, or gender) is required for update'
                });
            }


            if (gender && !['MALE', 'FEMALE'].includes(gender)) {
                return res.status(400).json({
                    success: false,
                    message: 'Gender must be MALE, FEMALE'
                });
            }

            const updatedDetail = await UserDetailService.userDetail.updateUserDetail(userId, {
                phoneNumber,
                address,
                gender
            });

            return res.status(200).json({
                success: true,
                message: 'User detail updated successfully',
                data: updatedDetail
            });
        } catch (error) {
            console.error('Error in updateUserDetail:', error);
            if (error.message === 'User detail not found. Create a new one first.') {
                return res.status(404).json({
                    success: false,
                    message: error.message,

                });
            }

            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    },

    async deleteUserDetail(req, res) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized - User not authenticated'
                });
            }

            await UserDetailService.userDetail.deleteUserDetail(userId);

            return res.status(200).json({
                success: true,
                message: 'User detail deleted successfully'
            });
        } catch (error) {
            console.error('Error in deleteUserDetail:', error);

            if (error.message === 'User detail not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    },
}


export default UserDetailController