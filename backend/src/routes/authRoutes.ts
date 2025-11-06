import { Router } from 'express';
import { register, login, forgotPassword, validateResetCode, resetPassword, validateUnlockCode } from '../controllers/authController';
import { validateRegister, handleValidationErrors } from '../middlewares/validationMiddleware';

const router = Router();

router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', login);

// Rotas para recuperação de senha
router.post('/forgot-password', forgotPassword);
router.post('/validate-reset-code', validateResetCode);
router.post('/reset-password', resetPassword);

// Rota para reativação de conta trancada
router.post('/validate-unlock-code', validateUnlockCode);


export default router;
