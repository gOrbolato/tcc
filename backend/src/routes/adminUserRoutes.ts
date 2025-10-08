import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/isAdmin';
import { getAllUsers } from '../controllers/adminUserController';
import { updateUserAsAdmin } from '../controllers/userController';

const router = Router();

// Rota para admin buscar usuários (com filtros)
router.get('/users', authenticate, isAdmin, getAllUsers);

// Rota para admin atualizar detalhes de um usuário comum
router.patch('/users/:id', authenticate, isAdmin, updateUserAsAdmin);

// Adicionar aqui futuramente as rotas de DELETE e outras que forem necessárias

export default router;