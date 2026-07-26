import express from 'express';
import offerController from '../../controllers/admin/index.js';
import { upload } from '../../middlewares/upload.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { isAdmin } from '../../middlewares/role.middleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(isAdmin);

// Offer Routes
router.get('/list', offerController.offer.getOffer);
router.post('/update', upload.single('image'), offerController.offer.updateOffer);
router.put('/details', offerController.offer.updateOfferDetails);

export default router;