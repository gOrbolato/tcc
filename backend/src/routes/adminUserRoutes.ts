import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/isAdmin';
import { getAllUsers, deleteUser, listDesbloqueios, approveDesbloqueio, rejectDesbloqueio } from '../controllers/adminUserController';
import { updateUserAsAdmin } from '../controllers/userController';

const router = Router();

// Rota para admin buscar usuários (com filtros)
router.get('/users', authenticate, isAdmin, getAllUsers);

// Rota para admin atualizar detalhes de um usuário comum
router.patch('/users/:id', authenticate, isAdmin, updateUserAsAdmin);

// Rotas para gerenciar pedidos de desbloqueio
router.get('/desbloqueios', authenticate, isAdmin, listDesbloqueios);
router.post('/desbloqueios/:id/approve', authenticate, isAdmin, approveDesbloqueio);
router.post('/desbloqueios/:id/reject', authenticate, isAdmin, rejectDesbloqueio);

router.delete('/users/:id', authenticate, isAdmin, deleteUser);

export default router;