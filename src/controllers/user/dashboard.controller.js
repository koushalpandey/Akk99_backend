import DashbaordService from '../../services/user/index.js';


const DashboardproductController = {
    async dashbaordController(req, res) {
        try {
            const productListData = await DashbaordService.dashbboard.DashbaordService()

            return res.status(200).json({
                message: "Dashbaord Product List",
                data: {
                    electronic: productListData.electronic,
                    testing: productListData.testing
                }

            })
        } catch (error) {
            console.log("error from Dashboard controller", error.message);
            return res.status(500).json({
                message: "Internal server error",
            })
        }


    }
}



export default DashboardproductController