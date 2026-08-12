import { Router } from 'express';
import reviewController from '../../controllers/user/index.js';
import validate from '../../middlewares/validate.js';
import { createReviewSchema } from '../../validators/review.validators.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();


router.post('/create', authMiddleware, validate(createReviewSchema), reviewController.review.creatReviewController);
// router.get("/:id", validate(productIdSchema, "params"),productController.getProduct);

export default router