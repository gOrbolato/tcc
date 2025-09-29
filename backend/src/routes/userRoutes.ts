import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { authenticate } from '../middlewares/authMiddleware';
import { validateUpdateProfile, handleValidationErrors } from '../middlewares/validationMiddleware';

const router = Router();

router.get('/perfil', authenticate, getProfile);
router.put('/perfil', authenticate, validateUpdateProfile, handleValidationErrors, updateProfile);

export default router;
