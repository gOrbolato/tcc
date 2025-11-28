// Importa a função Router do Express para criar um novo objeto de roteador.
import { Router } from 'express';
// Importa os controladores de desbloqueio para lidar com as requisições.
import { getPendingDesbloqueios, approveDesbloqueio, rejectDesbloqueio, getPendingDesbloqueioCount } from '../controllers/desbloqueioController';
// Importa o middleware de autenticação para proteger as rotas.
import { authenticate } from '../middlewares/authMiddleware';
// Importa o middleware de verificação de administrador.
import { isAdmin } from '../middlewares/isAdmin';

// Cria um novo objeto de roteador.
const router = Router();

// Rota para obter a contagem de solicitações de desbloqueio pendentes.
// Requer autenticação e privilégios de administrador.
router.get('/count', authenticate, isAdmin, getPendingDesbloqueioCount);

// Rota para listar todas as solicitações de desbloqueio pendentes.
// Requer autenticação e privilégios de administrador.
router.get('/', authenticate, isAdmin, getPendingDesbloqueios);

// Rota para aprovar uma solicitação de desbloqueio específica.
// Requer autenticação e privilégios de administrador.
router.post('/:id/approve', authenticate, isAdmin, approveDesbloqueio);

// Rota para rejeitar uma solicitação de desbloqueio específica.
// Requer autenticação e privilégios de administrador.
router.post('/:id/reject', authenticate, isAdmin, rejectDesbloqueio);

// Exporta o roteador para ser usado na aplicação principal.
export default router;
