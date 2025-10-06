import { Request, Response } from 'express';
import * as authService from '../services/authService';

export const register = async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  res.status(201).json({ message: 'Usuário registrado com sucesso!', user });
};

export const login = async (req: Request, res: Response) => {
  const { token, user } = await authService.login(req.body.email, req.body.senha);
  res.status(200).json({ token, user });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'O e-mail é obrigatório.' });
  }
  try {
    await authService.forgotPassword(email);
    // Mensagem genérica para não confirmar se o e-mail existe ou não
    res.json({ message: 'Se o e-mail estiver cadastrado, um link de recuperação foi enviado.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { senha } = req.body;
  if (!senha) {
    return res.status(400).json({ message: 'A nova senha é obrigatória.' });
  }
  try {
    await authService.resetPassword(token, senha);
    res.json({ message: 'Senha redefinida com sucesso.' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};