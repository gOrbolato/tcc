// Importa a pool de conexões do banco de dados.
import pool from '../config/database';
// Importa o tipo RowDataPacket do mysql2 para tipar os resultados das queries.
import { RowDataPacket } from 'mysql2';
// Importa a biblioteca bcrypt para hash de senhas e códigos.
import bcrypt from 'bcrypt';

// Função auxiliar para gerar um código aleatório (3 letras e 4 números).
const generateRandomCode = (): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 4; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
};

// Simulação de envio de e-mail.
const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
  console.log('--- SIMULANDO ENVIO DE E-MAIL DE DESBLOQUEIO ---');
  console.log(`Para: ${to}`);
  console.log(`Assunto: ${subject}`);
  console.log('Corpo: ' + text);
  console.log('----------------------------------');
};

/**
 * @function getPendingDesbloqueios
 * @description Busca e retorna as solicitações de desbloqueio pendentes, opcionalmente filtradas por data.
 * @param {string} [date] - A data para filtrar as solicitações (formato YYYY-MM-DD).
 * @returns {Promise<RowDataPacket[]>} - Uma promessa que resolve para um array de solicitações de desbloqueio.
 */
export const getPendingDesbloqueios = async (date?: string): Promise<RowDataPacket[]> => {
  let query = `
    SELECT d.id, d.motivo, d.criado_em, u.nome, u.email, u.anonymized_id
    FROM Desbloqueios d
    JOIN Usuarios u ON d.usuario_id = u.id
    WHERE d.status = 'PENDING'
  `;
  const params: any[] = [];

  if (date) {
    query += ' AND DATE(d.criado_em) = ?';
    params.push(date);
  }

  query += ' ORDER BY d.criado_em ASC';

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows;
};

/**
 * @function approveDesbloqueio
 * @description Aprova uma solicitação de desbloqueio, gera um código de verificação e o envia por e-mail.
 * @param {number} desbloqueioId - O ID da solicitação de desbloqueio.
 * @returns {Promise<void>}
 * @throws {Error} Se a solicitação não for encontrada ou já tiver sido processada.
 */
export const approveDesbloqueio = async (desbloqueioId: number): Promise<void> => {
  const [desbloqueioRows] = await pool.query<RowDataPacket[]>(
    'SELECT d.*, u.email FROM Desbloqueios d JOIN Usuarios u ON d.usuario_id = u.id WHERE d.id = ?',
    [desbloqueioId]
  );

  if (desbloqueioRows.length === 0) {
    throw new Error('Solicitação de desbloqueio não encontrada.');
  }

  const desbloqueio = desbloqueioRows[0];
  const userEmail = desbloqueio.email;

  if (desbloqueio.status !== 'PENDING') {
    throw new Error('Esta solicitação já foi processada.');
  }

  const verificationCode = generateRandomCode();
  const hashedCode = await bcrypt.hash(verificationCode, 10);
  const codeExpiresAt = new Date(Date.now() + 3600000); // Expira em 1 hora

  await pool.query(
    'UPDATE Desbloqueios SET status = \'APPROVED\', verification_code = ?, code_expires_at = ? WHERE id = ?',
    [hashedCode, codeExpiresAt, desbloqueioId]
  );

  await sendEmail(
    userEmail,
    'Seu Pedido de Desbloqueio foi Aprovado',
    `Olá,\n\nSua solicitação de desbloqueio de conta foi aprovada.\nUse o seguinte código para reativar seu acesso: ${verificationCode}\nEste código expira em 1 hora.\n`
  );
};

/**
 * @function rejectDesbloqueio
 * @description Rejeita uma solicitação de desbloqueio, alterando seu status para 'REJECTED'.
 * @param {number} desbloqueioId - O ID da solicitação de desbloqueio.
 * @returns {Promise<void>}
 */
export const rejectDesbloqueio = async (desbloqueioId: number): Promise<void> => {
  await pool.query('UPDATE Desbloqueios SET status = \'REJECTED\' WHERE id = ?', [desbloqueioId]);
};

/**
 * @function getPendingDesbloqueioCount
 * @description Retorna a contagem de solicitações de desbloqueio com status 'PENDING'.
 * @returns {Promise<number>} - Uma promessa que resolve para o número de solicitações pendentes.
 */
export const getPendingDesbloqueioCount = async (): Promise<number> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as count FROM Desbloqueios WHERE status = 'PENDING'"
  );
  return rows[0].count;
};
