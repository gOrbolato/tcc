// Importa a pool de conexões do banco de dados.
import pool from '../config/database';
// Importa o tipo RowDataPacket do mysql2 para tipar os resultados das queries.
import { RowDataPacket } from 'mysql2';

/**
 * @function createReactivationRequest
 * @description Cria uma nova solicitação de reativação de matrícula para um usuário.
 * @param {number} userId - O ID do usuário que está solicitando a reativação.
 * @returns {Promise<void>}
 * @throws {Error} Se o usuário já tiver uma solicitação pendente.
 */
export const createReactivationRequest = async (userId: number): Promise<void> => {
  // Verifica se já existe uma solicitação de reativação não lida para este usuário.
  const [existing] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM Notificacoes WHERE usuario_id = ? AND lida = FALSE',
    [userId]
  );

  // Se já houver uma solicitação, lança um erro.
  if (existing.length > 0) {
    throw new Error('Você já tem uma solicitação de reativação pendente.');
  }

  // Cria a mensagem da notificação.
  const mensagem = 'Solicitação de reativação de matrícula.';
  // Insere a nova notificação no banco de dados.
  await pool.query(
    'INSERT INTO Notificacoes (usuario_id, mensagem) VALUES (?, ?)',
    [userId, mensagem]
  );
};

/**
 * @function getUnreadNotifications
 * @description Busca e retorna todas as notificações não lidas.
 * @returns {Promise<RowDataPacket[]>} - Uma promessa que resolve para um array de notificações não lidas.
 */
export const getUnreadNotifications = async (): Promise<RowDataPacket[]> => {
  // Busca as notificações não lidas, juntando com a tabela de usuários para obter nome e RA.
  const [notifications] = await pool.query<RowDataPacket[]>(
    `SELECT n.id, n.mensagem, n.criado_em, u.nome, u.ra 
     FROM Notificacoes n 
     JOIN Usuarios u ON n.usuario_id = u.id 
     WHERE n.lida = FALSE 
     ORDER BY n.criado_em ASC`
  );
  return notifications;
};

/**
 * @function markNotificationAsRead
 * @description Marca uma notificação específica como lida.
 * @param {number} notificationId - O ID da notificação a ser marcada como lida.
 * @returns {Promise<void>}
 */
export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  // Atualiza o status da notificação para 'lida' (TRUE) no banco de dados.
  await pool.query('UPDATE Notificacoes SET lida = TRUE WHERE id = ?', [notificationId]);
};
