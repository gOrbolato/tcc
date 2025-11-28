// Importa a função Router do Express para criar um novo objeto de roteador.
import { Router } from 'express';
// Importa os controladores de administrador para lidar com as requisições.
import { downloadReport, getAdminReports, getAdminNotifications, updateAdminProfile } from '../controllers/adminController';
// Importa o controlador de ações do administrador.
import { listAdminActions } from '../controllers/adminActionsController';
// Importa o middleware de autenticação para proteger as rotas.
import { authenticate } from '../middlewares/authMiddleware';
// Importa o middleware de verificação de administrador.
import { isAdmin } from '../middlewares/isAdmin';

// Cria um novo objeto de roteador.
const router = Router();

// Rota para o administrador baixar o relatório de avaliações em PDF.
// Requer autenticação e privilégios de administrador.
router.get('/report/download', authenticate, isAdmin, downloadReport);

// Rota para o administrador buscar os dados para os relatórios.
// Requer autenticação e privilégios de administrador.
router.get('/reports', authenticate, isAdmin, getAdminReports);

// Rota para o administrador buscar notificações pendentes.
// Requer autenticação e privilégios de administrador.
router.get('/notifications', authenticate, isAdmin, getAdminNotifications);

// Rota para listar as ações (logs) realizadas pelos administradores.
// Requer autenticação e privilégios de administrador.
router.get('/actions', authenticate, isAdmin, listAdminActions);

// Rota para o administrador atualizar seu próprio perfil.
// Requer autenticação e privilégios de administrador.
router.put('/perfil', authenticate, isAdmin, updateAdminProfile);

// Exporta o roteador para ser usado na aplicação principal.
export default router;