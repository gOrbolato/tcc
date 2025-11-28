// Importa a pool de conexões do banco de dados.
import pool from '../config/database';
// Importa o tipo RowDataPacket do mysql2 para tipar os resultados das queries.
import { RowDataPacket } from 'mysql2';

/**
 * @function getAllInstitutions
 * @description Busca e retorna todas as instituições ativas, com a média de suas avaliações, opcionalmente filtradas por um termo de busca.
 * @param {string} [q] - Termo de busca para nome da instituição, cidade, estado ou nome de curso associado.
 * @returns {Promise<RowDataPacket[]>} - Uma promessa que resolve para um array de instituições.
 */
export const getAllInstitutions = async (q?: string): Promise<RowDataPacket[]> => {
  let query = `
    SELECT
      i.id, i.nome, i.latitude, i.longitude, i.cidade, i.estado,
      (SELECT AVG(a.media_final) FROM Avaliacoes a WHERE a.instituicao_id = i.id) AS media_avaliacoes
    FROM Instituicoes i
    WHERE i.is_active = TRUE
  `;
  const params: any[] = [];

  if (q) {
    const qNorm = `%${q.trim().replace(/\s+/g, ' ').toLowerCase()}%`;
    query += `
      AND (
        LOWER(i.nome) LIKE ? OR
        LOWER(i.cidade) LIKE ? OR
        LOWER(i.estado) LIKE ? OR
        EXISTS (
          SELECT 1 FROM Cursos c WHERE c.instituicao_id = i.id AND LOWER(c.nome) LIKE ?
        )
      )
    `;
    params.push(qNorm, qNorm, qNorm, qNorm);
  }

  query += ' ORDER BY ISNULL(media_avaliacoes), media_avaliacoes DESC, i.nome ASC';

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows;
};

/**
 * @function getCoursesByInstitution
 * @description Busca e retorna os cursos de uma instituição específica, opcionalmente filtrados por um termo de busca.
 * @param {number} [institutionId] - O ID da instituição.
 * @param {string} [q] - Termo de busca para o nome do curso.
 * @returns {Promise<RowDataPacket[]>} - Uma promessa que resolve para um array de cursos.
 */
export const getCoursesByInstitution = async (institutionId?: number, q?: string): Promise<RowDataPacket[]> => {
  let query = 'SELECT id, nome FROM Cursos WHERE is_active = TRUE';
  const params: (string | number)[] = [];
  let whereClauses: string[] = [];

  if (institutionId) {
    whereClauses.push('instituicao_id = ?');
    params.push(institutionId);
  }
  if (q) {
    const qNorm = q.trim().replace(/\s+/g, ' ').toLowerCase();
    whereClauses.push('LOWER(nome) LIKE ?');
    params.push(`%${qNorm}%`);
  }

  if (whereClauses.length > 0) {
    query += ` AND ${whereClauses.join(' AND ')}`;
  }

  query += ' ORDER BY nome ASC';
  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows;
};

/**
 * @function updateInstitution
 * @description Atualiza o nome de uma instituição.
 * @param {number} institutionId - O ID da instituição.
 * @param {string} nome - O novo nome da instituição.
 * @returns {Promise<RowDataPacket>} - O objeto da instituição atualizada.
 */
export const updateInstitution = async (institutionId: number, nome: string): Promise<RowDataPacket> => {
  const nomeNorm = String(nome).trim().replace(/\s+/g, ' ');
  await pool.query('UPDATE Instituicoes SET nome = ? WHERE id = ?', [nomeNorm, institutionId]);
  const [rows] = await pool.query<RowDataPacket[]>('SELECT id, nome FROM Instituicoes WHERE id = ?', [institutionId]);
  return rows[0];
};

/**
 * @function updateCourse
 * @description Atualiza o nome de um curso.
 * @param {number} courseId - O ID do curso.
 * @param {string} nome - O novo nome do curso.
 * @returns {Promise<RowDataPacket>} - O objeto do curso atualizado.
 */
export const updateCourse = async (courseId: number, nome: string): Promise<RowDataPacket> => {
  const nomeNorm = String(nome).trim().replace(/\s+/g, ' ');
  await pool.query('UPDATE Cursos SET nome = ? WHERE id = ?', [nomeNorm, courseId]);
  const [rows] = await pool.query<RowDataPacket[]>('SELECT id, nome FROM Cursos WHERE id = ?', [courseId]);
  return rows[0];
};

/**
 * @function deleteInstitution
 * @description Desativa uma instituição, verificando antes se existem dados associados.
 * @param {number} institutionId - O ID da instituição.
 * @throws {Error} Se existirem dados associados à instituição.
 */
export const deleteInstitution = async (institutionId: number): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query<RowDataPacket[]>('SELECT id FROM Usuarios WHERE instituicao_id = ?', [institutionId]);
    const [courses] = await connection.query<RowDataPacket[]>('SELECT id FROM Cursos WHERE instituicao_id = ?', [institutionId]);
    const [evaluations] = await connection.query<RowDataPacket[]>('SELECT id FROM Avaliacoes WHERE instituicao_id = ?', [institutionId]);

    if (users.length > 0 || courses.length > 0 || evaluations.length > 0) {
      throw new Error('Não é possível excluir a instituição pois existem dados associados a ela. Por favor, migre os dados para outra instituição antes de excluir.');
    }
    await connection.query('UPDATE Instituicoes SET is_active = FALSE WHERE id = ?', [institutionId]);
  } finally {
    connection.release();
  }
};

/**
 * @function deleteCourse
 * @description Desativa um curso, verificando antes se existem dados associados.
 * @param {number} courseId - O ID do curso.
 * @throws {Error} Se existirem dados associados ao curso.
 */
export const deleteCourse = async (courseId: number): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query<RowDataPacket[]>('SELECT id FROM Usuarios WHERE curso_id = ?', [courseId]);
    const [evaluations] = await connection.query<RowDataPacket[]>('SELECT id FROM Avaliacoes WHERE curso_id = ?', [courseId]);

    if (users.length > 0 || evaluations.length > 0) {
      throw new Error('Não é possível excluir o curso pois existem dados associados a ele. Por favor, migre os dados para outro curso antes de excluir.');
    }
    await connection.query('UPDATE Cursos SET is_active = FALSE WHERE id = ?', [courseId]);
  } finally {
    connection.release();
  }
};

/**
 * @function mergeInstitution
 * @description Mescla uma instituição de origem em uma de destino, migrando todos os dados associados.
 * @param {number} sourceInstitutionId - O ID da instituição de origem (será deletada).
 * @param {number} destinationInstitutionId - O ID da instituição de destino.
 */
export const mergeInstitution = async (sourceInstitutionId: number, destinationInstitutionId: number): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('UPDATE Usuarios SET instituicao_id = ? WHERE instituicao_id = ?', [destinationInstitutionId, sourceInstitutionId]);
    await connection.query('UPDATE Cursos SET instituicao_id = ? WHERE instituicao_id = ?', [destinationInstitutionId, sourceInstitutionId]);
    await connection.query('UPDATE Avaliacoes SET instituicao_id = ? WHERE instituicao_id = ?', [destinationInstitutionId, sourceInstitutionId]);
    await connection.query('DELETE FROM Instituicoes WHERE id = ?', [sourceInstitutionId]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * @function mergeCourse
 * @description Mescla um curso de origem em um de destino, migrando todos os dados associados.
 * @param {number} sourceCourseId - O ID do curso de origem (será deletado).
 * @param {number} destinationCourseId - O ID do curso de destino.
 */
export const mergeCourse = async (sourceCourseId: number, destinationCourseId: number): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('UPDATE Usuarios SET curso_id = ? WHERE curso_id = ?', [destinationCourseId, sourceCourseId]);
    await connection.query('UPDATE Avaliacoes SET curso_id = ? WHERE curso_id = ?', [destinationCourseId, sourceCourseId]);
    await connection.query('DELETE FROM Cursos WHERE id = ?', [sourceCourseId]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * @function getInstitutionsNearby
 * @description Busca instituições ativas próximas a uma dada coordenada, ordenadas por média de avaliação e distância.
 * @param {number} latitude - A latitude do ponto central.
 * @param {number} longitude - A longitude do ponto central.
 * @param {number} radius - O raio de busca em quilômetros.
 * @returns {Promise<RowDataPacket[]>} - Uma promessa que resolve para um array de instituições próximas.
 */
export const getInstitutionsNearby = async (latitude: number, longitude: number, radius: number): Promise<RowDataPacket[]> => {
  const [institutions] = await pool.query<RowDataPacket[]>(
    `SELECT 
      i.id, i.nome, i.latitude, i.longitude, 
      AVG(a.media_final) AS average_media_final,
      (6371 * acos(cos(radians(?)) * cos(radians(i.latitude)) * cos(radians(i.longitude) - radians(?)) + sin(radians(?)) * sin(radians(i.latitude)))) AS distance
    FROM Instituicoes i
    LEFT JOIN Avaliacoes a ON i.id = a.instituicao_id
    WHERE i.is_active = TRUE AND i.latitude IS NOT NULL AND i.longitude IS NOT NULL
    GROUP BY i.id, i.nome, i.latitude, i.longitude
    HAVING distance <= ?
    ORDER BY average_media_final DESC, distance ASC
    LIMIT 10`,
    [latitude, longitude, latitude, radius]
  );
  return institutions;
};
