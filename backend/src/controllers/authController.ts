import { Request, Response } from 'express';
import * as authService from '../services/authService';

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ message: 'Usuário registrado com sucesso!', user });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao registrar usuário.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { token, user } = await authService.login(req.body.email, req.body.senha) as { token: string; user: any };
    res.status(200).json({ token, user });
  } catch (error: any) {
    // MODIFICADO: Retorna 403 para conta trancada, para que o frontend possa redirecionar
    if (error.message === 'ACCOUNT_LOCKED') {
      return res.status(403).json({ message: error.message });
    }
    if (error.message.includes('inválidos')) {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Ocorreu um erro inesperado no servidor.' });
  }
};

export const validateUnlockCode = async (req: Request, res: Response) => {
  try {
    const { cpf, code } = req.body;
    if (!cpf || !code) {
      return res.status(400).json({ message: 'CPF e código são obrigatórios.' });
    }
    const result = await authService.validateUnlockCode(cpf, code);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao validar o código de desbloqueio.' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    await authService.forgotPassword(req.body.email);
    // For security do not return the code in the API response.
    res.status(200).json({ message: 'Se o e-mail estiver cadastrado, um código de recuperação foi enviado.' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao processar a solicitação de recuperação de senha.' });
  }
};

export const validateResetCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    await authService.validateResetCode(email, code);
    res.status(200).json({ message: 'Código validado com sucesso.' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao validar o código.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body; // Remove 'code'
    await authService.resetPassword(email, newPassword);
    res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao redefinir a senha.' });
  }
};