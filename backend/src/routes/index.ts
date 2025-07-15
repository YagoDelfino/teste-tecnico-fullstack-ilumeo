import { Router } from 'express';
import userRoutes from './userRoutes';
import timeRoutes from './timeRoutes';
import { AuthController } from '../controllers/authController';

const router = Router();

router.use('/users', userRoutes); 
router.use('/time', timeRoutes);
router.use('/auth', AuthController.loginWithUserCode)
export default router;