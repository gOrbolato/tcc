// Importa a pool de conexões do banco de dados.
import pool from '../config/database';
// Importa o tipo OkPacket do mysql2 para tipar os resultados de inserção.
import { OkPacket } from 'mysql2';

/**
 * @function logAutoCreatedEntity
 * @description Registra no banco de dados uma entidade (como instituição ou curso) que foi criada automaticamente durante o processo de registro de um usuário.
 * @param {string} entityType - O tipo da entidade criada (ex: 'instituicao', 'curso').
 * @param {string} entityName - O nome da entidade criada.
 * @param {string | null} [triggeredByEmail] - O email do usuário que desencadeou a criação.
 * @param {any} [metadata] - Metadados adicionais sobre a criação da entidade.
 * @returns {Promise<void>}
 */
export const logAutoCreatedEntity = async (entityType: string, entityName: string, triggeredByEmail?: string | null, metadata?: any): Promise<void> => {
  // Insere o log na tabela AutoCreatedEntities.
  await pool.query<OkPacket>(
    'INSERT INTO AutoCreatedEntities (entity_type, entity_name, triggered_by_email, metadata) VALUES (?, ?, ?, ?)',
    [
      entityType,
      entityName,
      triggeredByEmail || null,
      metadata ? JSON.stringify(metadata) : null // Converte os metadados para JSON se existirem.
    ]
  );
};

// Exporta a função para ser usada em outros serviços.
export default { logAutoCreatedEntity };
