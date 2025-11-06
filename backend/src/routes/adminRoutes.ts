import { Router } from 'express';
import { downloadReport, getAdminReports, getAdminNotifications, updateAdminProfile } from '../controllers/adminController';
import { listAdminActions } from '../controllers/adminActionsController';
import { authenticate } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

// Rota para admin baixar o relatório de avaliações
router.get('/report/download', authenticate, isAdmin, downloadReport);

// Nova rota para admin buscar dados do relatório
router.get('/reports', authenticate, isAdmin, getAdminReports);

// Nova rota para admin buscar notificações
router.get('/notifications', authenticate, isAdmin, getAdminNotifications);

// Rota para listar ações de admin (logs)
router.get('/actions', authenticate, isAdmin, listAdminActions);

router.put('/perfil', authenticate, isAdmin, updateAdminProfile);

export default router;