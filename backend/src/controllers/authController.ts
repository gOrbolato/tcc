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
    const { token, user } = await authService.login(req.body.email, req.body.senha);
    res.status(200).json({ token, user });
  } catch (error: any) {
    if (error.message.includes('inválidos') || error.message.includes('trancada')) {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Ocorreu um erro inesperado no servidor.' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.status(200).json({ message: 'Se o e-mail estiver cadastrado, um link de recuperação foi enviado.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao processar a solicitação de recuperação de senha.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    await authService.resetPassword(req.params.token, req.body.senha);
    res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};