import { Router } from 'express';
import { getReports } from '../controllers/adminController';
import { authenticate } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

// Adicione esta rota de login para o admin
router.post('/login', loginAdmin);

// A rota de registro pode ser protegida para que apenas outros admins possam registrar novos
router.post('/register', authenticateToken, isAdmin, registerAdmin);
router.get('/reports', authenticate, isAdmin, getReports);
export default router;
