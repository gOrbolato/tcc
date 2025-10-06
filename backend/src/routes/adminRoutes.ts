import { Router } from 'express';
import { getReports } from '../controllers/adminController';
import { authenticate } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/isAdmin';
// Importando os controllers corretos
import { login, register } from '../controllers/authController';

const router = Router();

// Usando a função de login geral. A lógica de ser admin é tratada no serviço.
router.post('/login', login);

// Rota para registrar um novo usuário (pode ser um admin ou não, dependendo da lógica no controller)
// Apenas admins autenticados podem acessar esta rota para registrar novos usuários.
router.post('/register', authenticate, isAdmin, register);

router.get('/reports', authenticate, isAdmin, getReports);

export default router;