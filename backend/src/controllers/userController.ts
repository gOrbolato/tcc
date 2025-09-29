import { Response } from 'express';
import * as userService from '../services/userService';

// Adicionando uma interface para estender o Request do Express
import { Request as ExpressRequest } from 'express';
interface AuthRequest extends ExpressRequest {
  user?: any;
}

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await userService.getProfile(req.user.id);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    res.status(200).json({ message: 'Perfil atualizado com sucesso!', user });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
