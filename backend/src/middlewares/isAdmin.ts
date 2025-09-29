import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

interface AuthRequest extends Request {
  user?: any;
}

export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Não autenticado.' });
  }

  try {
    const [admins] = await pool.query<RowDataPacket[]>('SELECT id FROM Admins WHERE id = ?', [req.user.id]);
    if (admins.length === 0) {
      return res.status(403).json({ message: 'Acesso negado: Requer privilégios de administrador.' });
    }
    next();
  } catch (error) {
    console.error('Erro ao verificar privilégios de administrador:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
