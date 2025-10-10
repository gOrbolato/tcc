import { Router } from 'express';
import { register, login, forgotPassword, validateResetCode, resetPassword } from '../controllers/authController';
import { validateRegister, handleValidationErrors } from '../middlewares/validationMiddleware';

const router = Router();

router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/validate-reset-code', validateResetCode);
router.post('/reset-password', resetPassword);


export default router;
