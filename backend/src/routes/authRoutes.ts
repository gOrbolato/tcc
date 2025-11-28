// Importa a função Router do Express para criar um novo objeto de roteador.
import { Router } from 'express';
// Importa os controladores de autenticação para lidar com as requisições.
import { register, login, forgotPassword, validateResetCode, resetPassword, validateUnlockCode } from '../controllers/authController';
// Importa os middlewares de validação para o registro de usuário.
import { validateRegister, handleValidationErrors } from '../middlewares/validationMiddleware';

// Cria um novo objeto de roteador.
const router = Router();

// Rota para registrar um novo usuário.
// Utiliza middlewares para validar os dados da requisição antes de chamar o controlador.
router.post('/register', validateRegister, handleValidationErrors, register);

// Rota para login de usuário.
router.post('/login', login);

// Rota para solicitar a redefinição de senha (envio de código de recuperação).
router.post('/forgot-password', forgotPassword);

// Rota para validar o código de redefinição de senha.
router.post('/validate-reset-code', validateResetCode);

// Rota para redefinir a senha com uma nova senha.
router.post('/reset-password', resetPassword);

// Rota para validar o código de desbloqueio de uma conta trancada.
router.post('/validate-unlock-code', validateUnlockCode);

// Exporta o roteador para ser usado na aplicação principal.
export default router;
