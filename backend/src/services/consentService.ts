// Importa a pool de conexões do banco de dados.
import pool from '../config/database';
// Importa o tipo OkPacket do mysql2 para tipar os resultados de inserção.
import { OkPacket } from 'mysql2';

/**
 * @function submitConsent
 * @description Registra o consentimento de um usuário no banco de dados.
 * @param {number} userId - O ID do usuário que está dando o consentimento.
 * @param {string} type - O tipo de consentimento (ex: 'cookies', 'terms_of_service').
 * @param {boolean} agreed - Se o usuário concordou ou não.
 * @param {string} [version] - A versão do documento de consentimento.
 * @param {string} [source] - A origem da solicitação de consentimento (ex: 'registration_form').
 * @param {any} [metadata] - Metadados adicionais.
 * @param {string} [ip_address] - O endereço IP do usuário.
 * @param {string} [user_agent] - O user agent do navegador do usuário.
 * @returns {Promise<any>} - Uma promessa que resolve para o objeto de consentimento registrado.
 */
export const submitConsent = async (
  userId: number,
  type: string,
  agreed: boolean,
  version?: string,
  source?: string,
  metadata?: any,
  ip_address?: string,
  user_agent?: string
): Promise<any> => {
  // Insere o registro de consentimento na tabela 'Consents'.
  const [result] = await pool.query<OkPacket>(
    // A palavra 'type' é uma palavra-chave reservada, por isso é escapada com crases.
    'INSERT INTO Consents (user_id, `type`, agreed, version, source, metadata, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      userId || null,
      type,
      agreed ? 1 : 0, // Converte o booleano para 1 ou 0 para o banco de dados.
      version || null,
      source || null,
      metadata ? JSON.stringify(metadata) : null, // Converte metadados para JSON, se existirem.
      ip_address || null,
      user_agent || null
    ]
  );

  // Retorna um objeto com os dados do consentimento registrado, incluindo o ID da inserção.
  return { id: result.insertId, userId, type, agreed, version, source, metadata, ip_address, user_agent };
};
