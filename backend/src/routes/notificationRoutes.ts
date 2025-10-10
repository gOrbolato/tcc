
import { Router } from 'express';
import { requestReactivation } from '../controllers/notificationController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Rota para o usuário criar uma solicitação de reativação
router.post('/reactivation-request', authenticate, requestReactivation);

export default router;
