import { Request, Response } from 'express';
import * as adminUserService from '../services/adminUserService';

interface AuthRequest extends Request {
  user?: any;
}

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const admin = await adminUserService.createAdmin(req.body);
    res.status(201).json({ message: 'Administrador criado com sucesso!', admin });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await adminUserService.getAdmins();
    res.status(200).json(admins);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAdmin = async (req: Request, res: Response) => {
  try {
    const admin = await adminUserService.updateAdmin(Number(req.params.id), req.body);
    res.status(200).json({ message: 'Administrador atualizado com sucesso!', admin });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    await adminUserService.deleteAdmin(Number(req.params.id));
    res.status(200).json({ message: 'Administrador excluído com sucesso!' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
