import { Router } from 'express';
import { getEvaluations, getTemplate, getUserAvailable, getUserCompleted, getEvaluationStatus } from '../controllers/evaluationController';
import { submitEvaluation, getEvaluationDetailsById } from '../controllers/userEvaluationController'; // Importa a nova função
import { authenticate } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

// Rota para admin buscar avaliações com filtros
router.get('/', authenticate, isAdmin, getEvaluations);

// Rota para usuário logado submeter uma nova avaliação
router.post('/', authenticate, submitEvaluation);

// Rota para usuário logado buscar os detalhes de uma avaliação específica
// Rota para obter template de avaliação (usada para nova avaliação)
router.get('/template', authenticate, getTemplate);

// Rota para verificar o status de avaliação do usuário (cooldown)
router.get('/user/status', authenticate, getEvaluationStatus);

// Backwards-compatible routes expected by older frontend code
router.get('/user/available', authenticate, getUserAvailable);
router.get('/user/completed', authenticate, getUserCompleted);

// Rota para usuário logado buscar os detalhes de uma avaliação específica
router.get('/:id', authenticate, getEvaluationDetailsById);

export default router;