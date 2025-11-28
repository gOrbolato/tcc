// Importa os tipos Request e Response do Express para lidar com as requisições e respostas HTTP.
import { Request, Response } from 'express';
// Importa o serviço de autenticação para interagir com a lógica de negócio.
import * as authService from '../services/authService';

/**
 * @function register
 * @description Registra um novo usuário no sistema.
 * @param {Request} req - O objeto de requisição do Express, contendo os dados do usuário.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Chama o serviço para registrar o usuário.
    const user = await authService.register(req.body);
    // Retorna uma mensagem de sucesso e os dados do usuário criado.
    res.status(201).json({ message: 'Usuário registrado com sucesso!', user });
  } catch (error: any) {
    // Em caso de erro, retorna uma resposta de erro 400.
    res.status(400).json({ message: error.message || 'Erro ao registrar usuário.' });
  }
};

/**
 * @function login
 * @description Autentica um usuário e retorna um token JWT.
 * @param {Request} req - O objeto de requisição do Express, contendo email e senha.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Chama o serviço para realizar o login.
    const { token, user } = await authService.login(req.body.email, req.body.senha) as { token: string; user: any };
    // Retorna o token e os dados do usuário.
    return res.status(200).json({ token, user });
  } catch (error: any) {
    // Se a conta estiver bloqueada, retorna status 403.
    if (error.message === 'ACCOUNT_LOCKED') {
      return res.status(403).json({ message: error.message });
    }
    // Se as credenciais forem inválidas, retorna status 401.
    if (error.message.includes('inválidos')) {
      return res.status(401).json({ message: error.message });
    }
    // Para outros erros, retorna status 500.
    return res.status(500).json({ message: 'Ocorreu um erro inesperado no servidor.' });
  }
};

/**
 * @function validateUnlockCode
 * @description Valida um código de desbloqueio de conta.
 * @param {Request} req - O objeto de requisição do Express, contendo CPF e código.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const validateUnlockCode = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { cpf, code } = req.body;
    // Valida se CPF e código foram fornecidos.
    if (!cpf || !code) {
      return res.status(400).json({ message: 'CPF e código são obrigatórios.' });
    }
    // Chama o serviço para validar o código de desbloqueio.
    const result = await authService.validateUnlockCode(cpf, code);
    return res.status(200).json(result);
  } catch (error: any) {
    // Em caso de erro, retorna uma resposta de erro 400.
    return res.status(400).json({ message: error.message || 'Erro ao validar o código de desbloqueio.' });
  }
};

/**
 * @function forgotPassword
 * @description Envia um código de recuperação de senha para o email do usuário.
 * @param {Request} req - O objeto de requisição do Express, contendo o email.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // Chama o serviço para iniciar o processo de esqueci minha senha.
    await authService.forgotPassword(req.body.email);
    // Retorna uma mensagem genérica por segurança.
    res.status(200).json({ message: 'Se o e-mail estiver cadastrado, um código de recuperação foi enviado.' });
  } catch (error: any) {
    // Em caso de erro, retorna uma resposta de erro 400.
    res.status(400).json({ message: error.message || 'Erro ao processar a solicitação de recuperação de senha.' });
  }
};

/**
 * @function validateResetCode
 * @description Valida um código de redefinição de senha.
 * @param {Request} req - O objeto de requisição do Express, contendo email e código.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const validateResetCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;
    // Chama o serviço para validar o código de redefinição.
    await authService.validateResetCode(email, code);
    res.status(200).json({ message: 'Código validado com sucesso.' });
  } catch (error: any) {
    // Em caso de erro, retorna uma resposta de erro 400.
    res.status(400).json({ message: error.message || 'Erro ao validar o código.' });
  }
};

/**
 * @function resetPassword
 * @description Redefine a senha do usuário com uma nova senha.
 * @param {Request} req - O objeto de requisição do Express, contendo email e nova senha.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, newPassword } = req.body;
    // Chama o serviço para redefinir a senha.
    await authService.resetPassword(email, newPassword);
    res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (error: any) {
    // Em caso de erro, retorna uma resposta de erro 400.
    res.status(400).json({ message: error.message || 'Erro ao redefinir a senha.' });
  }
};