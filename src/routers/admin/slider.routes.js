import express from 'express';
import sliderController from '../../controllers/admin/index.js';
import { upload } from '../../middlewares/upload.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { isAdmin } from '../../middlewares/role.middleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(isAdmin);

// Slider Routes
router.post('/create', upload.single('image'), sliderController.slider.createSlider);
router.put('/update/:id', upload.single('image'), sliderController.slider.updateSlider);
router.delete('/delete/:id', sliderController.slider.deleteSlider);
router.get('/details/:id', sliderController.slider.getSlider);
router.get('/list', sliderController.slider.getSliders);
router.patch('/update-order/:id', sliderController.slider.updateSliderOrder);
router.patch('/update-status/:id', sliderController.slider.updateSliderStatus);
router.get('/active/all', sliderController.slider.getActiveSliders);

export default router;