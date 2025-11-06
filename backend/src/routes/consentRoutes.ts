import { Router } from 'express';
import { submitConsent } from '../controllers/consentController';
import { validateConsentSubmission, handleValidationErrors } from '../middlewares/validationMiddleware';

const router = Router();

// Allow anonymous consent submissions; if user is authenticated, controller will attach userId
router.post('/consent', validateConsentSubmission, handleValidationErrors, submitConsent);

export default router;
