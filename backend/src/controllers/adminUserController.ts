import { Request, Response } from 'express';
import * as adminUserService from '../services/adminUserService';
import * as userService from '../services/userService';
import pool from '../config/database';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const filters = {
      ra: req.query.ra as string | undefined,
      q: req.query.q as string | undefined,
      institutionId: req.query.institutionId as string | undefined,
      courseId: req.query.courseId as string | undefined,
      anonymizedId: req.query.anonymizedId as string | undefined,
    };
    const users = await adminUserService.getFilteredUsers(filters);
    res.status(200).json(users);
  } catch (error: any) {
    console.error("--- ERRO DETALHADO AO BUSCAR USUÁRIOS ---", error);
    res.status(500).json({ message: 'Erro ao buscar usuários.', error: error.message });
  }
};

export const listDesbloqueios = async (_req: Request, res: Response) => {
  try {
    // Return anonymized_id instead of exposing nome/email
    const [rows] = await pool.query(
      'SELECT d.id, d.usuario_id, d.status, d.motivo, d.criado_em, u.anonymized_id FROM Desbloqueios d JOIN Usuarios u ON d.usuario_id = u.id WHERE d.status = ? ORDER BY d.criado_em ASC',
      ['PENDING']
    );
    res.status(200).json(rows);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const approveDesbloqueio = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const adminId = (req as any).user?.id || null;
    // set desbloqueio status approved and unlock user
    await pool.query('UPDATE Desbloqueios SET status = ?, admin_id = ?, atualizado_em = NOW() WHERE id = ?', ['APPROVED', adminId, id]);
    // get record to know usuario_id
    const [rows] = await pool.query<any[]>('SELECT usuario_id FROM Desbloqueios WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Pedido não encontrado.' });
    const usuarioId = rows[0].usuario_id;
    await pool.query('UPDATE Usuarios SET is_active = TRUE WHERE id = ?', [usuarioId]);
    res.status(200).json({ message: 'Desbloqueio aprovado e usuário desbloqueado.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    await adminUserService.deleteUser(userId);
    res.status(200).json({ message: 'Usuário removido com sucesso!' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const rejectDesbloqueio = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const adminId = (req as any).user?.id || null;
    await pool.query('UPDATE Desbloqueios SET status = ?, admin_id = ?, atualizado_em = NOW() WHERE id = ?', ['REJECTED', adminId, id]);
    res.status(200).json({ message: 'Pedido rejeitado.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};