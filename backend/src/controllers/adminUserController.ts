import { Request, Response } from 'express';
import * as adminUserService from '../services/adminUserService';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const filters = {
      ra: req.query.ra as string | undefined,
      institutionId: req.query.institutionId as string | undefined,
      courseId: req.query.courseId as string | undefined,
    };
    const users = await adminUserService.getFilteredUsers(filters);
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar usuários.', error: error.message });
  }
};