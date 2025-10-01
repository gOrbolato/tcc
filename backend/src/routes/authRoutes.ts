import { Router } from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/authController';
import { validateRegister, handleValidationErrors } from '../middlewares/validationMiddleware';

const router = Router();

router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);


export default router;
