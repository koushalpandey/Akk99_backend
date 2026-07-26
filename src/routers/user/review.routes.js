import express from 'express';
import reviewController from '../../controllers/user/index.js';
import validate from '../../middlewares/validate.js';
import { createReviewSchema } from '../../validators/review.validators.js';

const router = express.Router();


router.post('/create',validate(createReviewSchema),reviewController.review.creatReviewController );
// router.get("/:id", validate(productIdSchema, "params"),productController.getProduct);

export default router