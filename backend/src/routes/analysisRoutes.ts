import { Router } from 'express';
import { getInstitutionAnalysis } from '../controllers/analysisController';
import { authenticate, adminOnly } from '../middlewares/authMiddleware';

const router = Router();

// Rota para obter a análise de uma instituição
// Protegida para que apenas administradores autenticados possam acessá-la
router.get(
  '/analysis/institution/:id',
  authenticate, 
  adminOnly,
  getInstitutionAnalysis
);

export default router;
