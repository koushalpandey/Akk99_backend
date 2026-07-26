import { json } from "express";
import reviewService from "../../services/user/index.js";

const reviewController = {
  async creatReviewController(req, res) {
    try {
      const { productId, rating, comment } = req.body;
      const userId = req.user.id;

     const reviewData = await reviewService.reviwe.reviewCreateService({
        userId,
        productId,
        rating,
        comment,
      });
      return res.status(200).json({
        message: "successfully created",
      });
    } catch (error) {
      console.log("error from review Controller", error.message);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
  async getReview() {},
  async editReview() {
    // will add later
  },

  async deleteReview() {},
};

export default reviewController;
