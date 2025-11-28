// Importa a função Router do Express para criar um novo objeto de roteador.
import { Router } from 'express';
// Importa os controladores de avaliação para lidar com as requisições.
import { getEvaluations, getTemplate, getUserAvailable, getUserCompleted, getEvaluationStatus } from '../controllers/evaluationController';
// Importa os controladores de avaliação do usuário.
import { submitEvaluation, getEvaluationDetailsById } from '../controllers/userEvaluationController';
// Importa o middleware de autenticação para proteger as rotas.
import { authenticate } from '../middlewares/authMiddleware';
// Importa o middleware de verificação de administrador.
import { isAdmin } from '../middlewares/isAdmin';

// Cria um novo objeto de roteador.
const router = Router();

// Rota para o administrador buscar avaliações com filtros.
// Requer autenticação e privilégios de administrador.
router.get('/', authenticate, isAdmin, getEvaluations);

// Rota para um usuário logado submeter uma nova avaliação.
// Requer autenticação.
router.post('/', authenticate, submitEvaluation);

// Rota para obter o template de avaliação (usado para criar uma nova avaliação).
// Requer autenticação.
router.get('/template', authenticate, getTemplate);

// Rota para verificar o status da avaliação de um usuário (cooldown).
// Requer autenticação.
router.get('/user/status', authenticate, getEvaluationStatus);

// Rota para obter as avaliações disponíveis para um usuário.
// Mantida para compatibilidade com versões mais antigas do frontend.
router.get('/user/available', authenticate, getUserAvailable);

// Rota para obter as avaliações completadas por um usuário.
// Mantida para compatibilidade com versões mais antigas do frontend.
router.get('/user/completed', authenticate, getUserCompleted);

// Rota para um usuário logado buscar os detalhes de uma avaliação específica.
// Requer autenticação.
router.get('/:id', authenticate, getEvaluationDetailsById);

// Exporta o roteador para ser usado na aplicação principal.
export default router;