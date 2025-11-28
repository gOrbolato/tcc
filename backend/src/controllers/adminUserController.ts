// Importa os tipos Request e Response do Express para lidar com as requisições e respostas HTTP.
import { Request, Response } from 'express';
// Importa o serviço de usuário administrador para interagir com a lógica de negócio.
import * as adminUserService from '../services/adminUserService';
// Importa a pool de conexões do banco de dados.
import pool from '../config/database';

/**
 * @function getAllUsers
 * @description Busca e retorna uma lista de usuários com base em filtros.
 * @param {Request} req - O objeto de requisição do Express, contendo filtros na query.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Coleta filtros da query string da requisição.
    const filters = {
      ra: req.query.ra as string | undefined,
      q: req.query.q as string | undefined,
      institutionId: req.query.institutionId as string | undefined,
      courseId: req.query.courseId as string | undefined,
      anonymizedId: req.query.anonymizedId as string | undefined,
    };
    // Chama o serviço para buscar os usuários filtrados.
    const users = await adminUserService.getFilteredUsers(filters);
    // Retorna a lista de usuários com status 200.
    res.status(200).json(users);
  } catch (error: any) {
    // Em caso de erro, loga a falha e retorna uma resposta de erro 500.
    console.error("--- ERRO DETALHADO AO BUSCAR USUÁRIOS ---", error);
    res.status(500).json({ message: 'Erro ao buscar usuários.', error: error.message });
  }
};

/**
 * @function listDesbloqueios
 * @description Lista todas as solicitações de desbloqueio de usuário pendentes.
 * @param {Request} _req - O objeto de requisição do Express (não utilizado).
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const listDesbloqueios = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Executa uma query para buscar solicitações de desbloqueio pendentes.
    const [rows] = await pool.query(
      'SELECT d.id, d.usuario_id, d.status, d.motivo, d.criado_em, u.anonymized_id FROM Desbloqueios d JOIN Usuarios u ON d.usuario_id = u.id WHERE d.status = ? ORDER BY d.criado_em ASC',
      ['PENDING']
    );
    // Retorna as solicitações encontradas.
    res.status(200).json(rows);
  } catch (error: any) {
    // Em caso de erro, retorna uma resposta de erro 500.
    res.status(500).json({ message: error.message });
  }
};

/**
 * @function approveDesbloqueio
 * @description Aprova uma solicitação de desbloqueio e reativa o usuário.
 * @param {Request} req - O objeto de requisição do Express, contendo o ID do desbloqueio.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const approveDesbloqueio = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Number(req.params.id);
    const adminId = (req as any).user?.id || null;
    
    // Atualiza o status do desbloqueio para 'APPROVED'.
    await pool.query('UPDATE Desbloqueios SET status = ?, admin_id = ?, atualizado_em = NOW() WHERE id = ?', ['APPROVED', adminId, id]);
    
    // Busca o ID do usuário associado ao desbloqueio.
    const [rows] = await pool.query<any[]>('SELECT usuario_id FROM Desbloqueios WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Pedido não encontrado.' });
    
    const usuarioId = rows[0].usuario_id;
    // Ativa novamente o usuário no sistema.
    await pool.query('UPDATE Usuarios SET is_active = TRUE WHERE id = ?', [usuarioId]);
    
    return res.status(200).json({ message: 'Desbloqueio aprovado e usuário desbloqueado.' });
  } catch (error: any) {
    // Em caso de erro, retorna uma resposta de erro 500.
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @function deleteUser
 * @description Remove um usuário do sistema.
 * @param {Request} req - O objeto de requisição do Express, contendo o ID do usuário.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    // Chama o serviço para remover o usuário.
    await adminUserService.deleteUser(userId);
    // Retorna uma mensagem de sucesso.
    res.status(200).json({ message: 'Usuário removido com sucesso!' });
  } catch (error: any) {
    // Em caso de erro, retorna uma resposta de erro 400.
    res.status(400).json({ message: error.message });
  }
};

/**
 * @function rejectDesbloqueio
 * @description Rejeita uma solicitação de desbloqueio de usuário.
 * @param {Request} req - O objeto de requisição do Express, contendo o ID do desbloqueio.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const rejectDesbloqueio = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const adminId = (req as any).user?.id || null;
    // Atualiza o status do desbloqueio para 'REJECTED'.
    await pool.query('UPDATE Desbloqueios SET status = ?, admin_id = ?, atualizado_em = NOW() WHERE id = ?', ['REJECTED', adminId, id]);
    // Retorna uma mensagem de sucesso.
    res.status(200).json({ message: 'Pedido rejeitado.' });
  } catch (error: any) {
    // Em caso de erro, retorna uma resposta de erro 500.
    res.status(500).json({ message: error.message });
  }
};