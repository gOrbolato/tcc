import { Router } from 'express';
import { getEvaluations } from '../controllers/evaluationController';
import { authenticate } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

// Rota GET para buscar avaliações com filtros
router.get('/', authenticate, isAdmin, getEvaluations);

export default router;