// Importa a função Router do Express para criar um novo objeto de roteador.
import { Router } from 'express';
// Importa o controlador de notificação para lidar com a requisição.
import { requestReactivation } from '../controllers/notificationController';
// Importa o middleware de autenticação para proteger a rota.
import { authenticate } from '../middlewares/authMiddleware';

// Cria um novo objeto de roteador.
const router = Router();

// Rota para o usuário criar uma solicitação de reativação de conta.
// Requer que o usuário esteja autenticado.
router.post('/reactivation-request', authenticate, requestReactivation);

// Exporta o roteador para ser usado na aplicação principal.
export default router;
