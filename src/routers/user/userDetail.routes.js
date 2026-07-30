import express from 'express';
import UserDetailController from '../../controllers/user/index.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);


router.post('/create', UserDetailController.userDetail.createUserAddress);
router.get('/get', UserDetailController.userDetail.getUserDetail);
router.put('/update', UserDetailController.userDetail.updateUserDetail);
router.delete('/delete', UserDetailController.userDetail.deleteUserDetail);


export default router;              