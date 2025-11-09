import { Router } from 'express';
import { getInstitutionAnalysis, downloadReportPdf } from '../controllers/analysisController';
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

// Nova rota para download do relatório em PDF
router.get(
  '/analysis/institution/:id/pdf',
  authenticate,
  adminOnly,
  downloadReportPdf
);

export default router;
