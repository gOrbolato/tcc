import { Request, Response } from 'express';
import * as authService from '../services/authService';

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ message: 'Usuário registrado com sucesso!', user });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { token, user } = await authService.login(req.body.email, req.body.senha);
    res.status(200).json({ token, user });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const resetToken = await authService.forgotPassword(email);
    res.status(200).json({ message: 'Token de redefinição de senha gerado. Verifique seu e-mail (ou console para teste). ', resetToken });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    res.status(200).json({ message: 'Senha redefinida com sucesso!' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
