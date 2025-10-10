import { Router } from 'express';
import { getEvaluations } from '../controllers/evaluationController';
import { submitEvaluation, getEvaluationDetailsById } from '../controllers/userEvaluationController'; // Importa a nova função
import { authenticate } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

// Rota para admin buscar avaliações com filtros
router.get('/', authenticate, isAdmin, getEvaluations);

// Rota para usuário logado submeter uma nova avaliação
router.post('/', authenticate, submitEvaluation);

// Rota para usuário logado buscar os detalhes de uma avaliação específica
router.get('/:id', authenticate, getEvaluationDetailsById);

export default router;