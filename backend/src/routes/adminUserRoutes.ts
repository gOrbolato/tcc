import { Router } from 'express';
import { createAdmin, getAdmins, updateAdmin, deleteAdmin } from '../controllers/adminUserController';
import { authenticate } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

// Todas as rotas de gerenciamento de admin requerem autenticação e privilégios de admin
router.post('/admin/users', authenticate, isAdmin, createAdmin);
router.get('/admin/users', authenticate, isAdmin, getAdmins);
router.put('/admin/users/:id', authenticate, isAdmin, updateAdmin);
router.delete('/admin/users/:id', authenticate, isAdmin, deleteAdmin);

export default router;
