import { Router } from 'express'; // A linha que faltava
import { getProfile, updateProfile } from '../controllers/userController';
import { getMyEvaluations } from '../controllers/evaluationController';
import { authenticate } from '../middlewares/authMiddleware';
import { validateUpdateProfile, handleValidationErrors } from '../middlewares/validationMiddleware';

const router = Router();

// Rotas de Perfil
router.get('/perfil', authenticate, getProfile);
router.put('/perfil', authenticate, validateUpdateProfile, handleValidationErrors, updateProfile);

// Rota para buscar as avaliações do usuário logado
router.get('/my-evaluations', authenticate, getMyEvaluations);

export default router;