import { Router } from 'express';
import { submitEvaluation, getEvaluations } from '../controllers/evaluationController';
import { authenticate } from '../middlewares/authMiddleware';
import { validateEvaluation, handleValidationErrors } from '../middlewares/validationMiddleware';

const router = Router();

router.post('/avaliacoes', authenticate, validateEvaluation, handleValidationErrors, submitEvaluation);
router.get('/avaliacoes/me', authenticate, getEvaluations);

export default router;
