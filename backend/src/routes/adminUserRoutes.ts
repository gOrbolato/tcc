// Importa a função Router do Express para criar um novo objeto de roteador.
import { Router } from 'express';
// Importa o middleware de autenticação para proteger as rotas.
import { authenticate } from '../middlewares/authMiddleware';
// Importa o middleware de verificação de administrador.
import { isAdmin } from '../middlewares/isAdmin';
// Importa os controladores de usuário administrador para lidar com as requisições.
import { getAllUsers, deleteUser, listDesbloqueios, approveDesbloqueio, rejectDesbloqueio } from '../controllers/adminUserController';
// Importa o controlador de usuário para atualização de dados pelo admin.
import { updateUserAsAdmin } from '../controllers/userController';

// Cria um novo objeto de roteador.
const router = Router();

// Rota para o administrador buscar todos os usuários (com filtros).
// Requer autenticação e privilégios de administrador.
router.get('/users', authenticate, isAdmin, getAllUsers);

// Rota para o administrador atualizar detalhes de um usuário específico.
// Requer autenticação e privilégios de administrador.
router.patch('/users/:id', authenticate, isAdmin, updateUserAsAdmin);

// Rota para o administrador listar as solicitações de desbloqueio pendentes.
// Requer autenticação e privilégios de administrador.
router.get('/desbloqueios', authenticate, isAdmin, listDesbloqueios);

// Rota para o administrador aprovar uma solicitação de desbloqueio.
// Requer autenticação e privilégios de administrador.
router.post('/desbloqueios/:id/approve', authenticate, isAdmin, approveDesbloqueio);

// Rota para o administrador rejeitar uma solicitação de desbloqueio.
// Requer autenticação e privilégios de administrador.
router.post('/desbloqueios/:id/reject', authenticate, isAdmin, rejectDesbloqueio);

// Rota para o administrador deletar um usuário.
// Requer autenticação e privilégios de administrador.
router.delete('/users/:id', authenticate, isAdmin, deleteUser);

// Exporta o roteador para ser usado na aplicação principal.
export default router;