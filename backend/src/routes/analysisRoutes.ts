// Importa a função Router do Express para criar um novo objeto de roteador.
import { Router } from 'express';
// Importa os controladores de análise para lidar com as requisições.
import { getInstitutionAnalysis, downloadReportPdf } from '../controllers/analysisController';
// Importa os middlewares de autenticação e verificação de administrador.
import { authenticate, adminOnly } from '../middlewares/authMiddleware';

// Cria um novo objeto de roteador.
const router = Router();

// Rota para obter a análise de uma instituição específica.
// A rota é protegida e só pode ser acessada por administradores autenticados.
router.get(
  '/analysis/institution/:id',
  authenticate, 
  adminOnly,
  getInstitutionAnalysis
);

// Rota para baixar o relatório de análise de uma instituição em formato PDF.
// A rota é protegida e só pode ser acessada por administradores autenticados.
router.get(
  '/analysis/institution/:id/pdf',
  authenticate,
  adminOnly,
  downloadReportPdf
);

// Exporta o roteador para ser usado na aplicação principal.
export default router;
