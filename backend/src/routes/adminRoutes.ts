import { Router } from 'express';
import { getReports } from '../controllers/adminController';
import { authenticate } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

router.get('/admin/reports', authenticate, isAdmin, getReports);

export default router;
