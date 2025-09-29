import { Router } from 'express';
import { submitConsent } from '../controllers/consentController';
import { authenticate } from '../middlewares/authMiddleware';
import { validateConsent, handleValidationErrors } from '../middlewares/validationMiddleware';

const router = Router();

router.post('/consent', authenticate, validateConsent, handleValidationErrors, submitConsent);

export default router;
