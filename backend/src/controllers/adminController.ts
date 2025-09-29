import { Response } from 'express';
import * as adminService from '../services/adminService';

// Adicionando uma interface para estender o Request do Express
import { Request as ExpressRequest } from 'express';
interface AuthRequest extends ExpressRequest {
  user?: any;
}

export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    // Futuramente, verificar se req.user.role é 'admin'
    const reports = await adminService.generateReports();
    res.status(200).json(reports);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
