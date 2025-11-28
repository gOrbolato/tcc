// Importa a função Router do Express para criar um novo objeto de roteador.
import { Router } from 'express';
// Importa os controladores de usuário para lidar com as requisições.
import { getProfile, updateProfile, trancarCurso, requestDesbloqueio, changePassword } from '../controllers/userController';
// Importa o controlador de avaliação para buscar as avaliações do usuário.
import { getMyEvaluations } from '../controllers/evaluationController';
// Importa o middleware de autenticação para proteger as rotas.
import { authenticate } from '../middlewares/authMiddleware';
// Importa os middlewares de validação para a atualização de perfil.
import { validateUpdateProfile, handleValidationErrors } from '../middlewares/validationMiddleware';

// Cria um novo objeto de roteador.
const router = Router();

// --- ROTAS DE PERFIL DO USUÁRIO ---

// Rota para obter o perfil do usuário autenticado.
router.get('/perfil', authenticate, getProfile);

// Rota para atualizar o perfil do usuário autenticado.
// Utiliza middlewares para validar os dados antes de atualizar.
router.put('/perfil', authenticate, validateUpdateProfile, handleValidationErrors, updateProfile);

// Rota para alterar a senha do usuário autenticado.
router.put('/change-password', authenticate, changePassword);

// --- ROTAS DE AÇÕES DO CURSO ---

// Rota para o usuário trancar o curso.
router.post('/trancar-curso', authenticate, trancarCurso);

// Rota para o usuário solicitar o desbloqueio da conta.
router.post('/request-desbloqueio', authenticate, requestDesbloqueio);

// --- ROTAS DE AVALIAÇÕES DO USUÁRIO ---

// Rota para buscar todas as avaliações feitas pelo usuário autenticado.
router.get('/my-evaluations', authenticate, getMyEvaluations);

// Exporta o roteador para ser usado na aplicação principal.
export default router;