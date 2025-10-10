import { Router } from 'express';
import { downloadReport, getAdminReports, getAdminNotifications } from '../controllers/adminController';
import { authenticate } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

// Rota para admin baixar o relatório de avaliações
router.get('/report/download', authenticate, isAdmin, downloadReport);

// Nova rota para admin buscar dados do relatório
router.get('/reports', authenticate, isAdmin, getAdminReports);

// Nova rota para admin buscar notificações
router.get('/notifications', authenticate, isAdmin, getAdminNotifications);

export default router;