
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

export const createReactivationRequest = async (userId: number) => {
  // Verifica se já existe uma solicitação não lida para este usuário
  const [existing] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM Notificacoes WHERE usuario_id = ? AND lida = FALSE',
    [userId]
  );

  if (existing.length > 0) {
    throw new Error('Você já tem uma solicitação de reativação pendente.');
  }

  const mensagem = 'Solicitação de reativação de matrícula.';
  await pool.query(
    'INSERT INTO Notificacoes (usuario_id, mensagem) VALUES (?, ?)',
    [userId, mensagem]
  );
};

export const getUnreadNotifications = async () => {
  const [notifications] = await pool.query<RowDataPacket[]>(
    `SELECT n.id, n.mensagem, n.criado_em, u.nome, u.ra 
     FROM Notificacoes n 
     JOIN Usuarios u ON n.usuario_id = u.id 
     WHERE n.lida = FALSE 
     ORDER BY n.criado_em ASC`
  );
  return notifications;
};

export const markNotificationAsRead = async (notificationId: number) => {
  await pool.query('UPDATE Notificacoes SET lida = TRUE WHERE id = ?', [notificationId]);
};
