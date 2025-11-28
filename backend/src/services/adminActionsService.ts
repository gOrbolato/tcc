// Importa a pool de conexões do banco de dados.
import pool from '../config/database';
// Importa o tipo OkPacket do mysql2 para tipar os resultados de inserção.
import { OkPacket } from 'mysql2';

/**
 * @function logAdminAction
 * @description Registra uma ação realizada por um administrador no banco de dados.
 * @param {number} adminId - O ID do administrador que realizou a ação.
 * @param {string} action - A descrição da ação (ex: 'delete_user', 'update_profile').
 * @param {number | null} [targetUserId] - O ID do usuário que foi alvo da ação.
 * @param {any} [details] - Detalhes adicionais sobre a ação em formato de objeto.
 * @returns {Promise<void>}
 */
export const logAdminAction = async (adminId: number, action: string, targetUserId?: number | null, details?: any): Promise<void> => {
  // Converte os detalhes para uma string JSON, se existirem.
  const detailsStr = details ? JSON.stringify(details) : null;
  // Insere o log da ação na tabela AdminActions.
  await pool.query<OkPacket>('INSERT INTO AdminActions (admin_id, target_user_id, action, details) VALUES (?, ?, ?, ?)', [adminId, targetUserId || null, action, detailsStr]);
};

/**
 * @function getAdminActions
 * @description Busca e retorna uma lista paginada das ações dos administradores.
 * @param {number} [limit=50] - O número máximo de registros a serem retornados.
 * @param {number} [offset=0] - O número de registros a serem ignorados (para paginação).
 * @returns {Promise<any[]>} - Uma promessa que resolve para um array de ações de administrador.
 */
export const getAdminActions = async (limit = 50, offset = 0): Promise<any[]> => {
  // Busca as ações da tabela AdminActions, ordenadas pela data de criação decrescente.
  const [rows] = await pool.query('SELECT id, admin_id, target_user_id, action, details, created_at FROM AdminActions ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
  return rows as any[];
};

// Exporta a função de log para ser usada em outros serviços.
export default { logAdminAction };
