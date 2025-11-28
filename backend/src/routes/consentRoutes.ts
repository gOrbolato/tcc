// Importa a função Router do Express para criar um novo objeto de roteador.
import { Router } from 'express';
// Importa o controlador de consentimento para lidar com as requisições.
import { submitConsent } from '../controllers/consentController';
// Importa os middlewares de validação para a submissão de consentimento.
import { validateConsentSubmission, handleValidationErrors } from '../middlewares/validationMiddleware';

// Cria um novo objeto de roteador.
const router = Router();

// Rota para submeter o consentimento do usuário.
// Permite submissões anônimas, mas se o usuário estiver autenticado, o ID será anexado pelo controlador.
// Utiliza middlewares para validar os dados da requisição antes de chamar o controlador.
router.post('/consent', validateConsentSubmission, handleValidationErrors, submitConsent);

// Exporta o roteador para ser usado na aplicação principal.
export default router;
