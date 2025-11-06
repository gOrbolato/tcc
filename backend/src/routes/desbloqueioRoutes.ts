import { Router } from 'express';
import { getPendingDesbloqueios, approveDesbloqueio, rejectDesbloqueio } from '../controllers/desbloqueioController';
import { authenticate } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

router.get('/', authenticate, isAdmin, getPendingDesbloqueios);
router.post('/:id/approve', authenticate, isAdmin, approveDesbloqueio);
router.post('/:id/reject', authenticate, isAdmin, rejectDesbloqueio);

export default router;
