import { Request, Response } from 'express';
import * as adminActionsService from '../services/adminActionsService';

export const listAdminActions = async (req: Request, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const offset = parseInt((req.query.offset as string) || '0', 10);
    const rows = await adminActionsService.getAdminActions(limit, offset);
    res.json({ data: rows });
  } catch (err) {
    console.error('Error fetching admin actions', err);
    res.status(500).json({ message: 'Erro ao buscar logs de admin' });
  }
};

export default { listAdminActions };
