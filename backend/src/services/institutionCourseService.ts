import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

export const getAllInstitutions = async (q?: string) => {
  // A base da query agora busca apenas de Instituicoes
  let query = `
    SELECT
      i.id,
      i.nome,
      i.latitude,
      i.longitude,
      i.cidade,
      i.estado,
      (SELECT AVG(a.media_final) FROM Avaliacoes a WHERE a.instituicao_id = i.id) AS media_avaliacoes
    FROM Instituicoes i
    WHERE i.is_active = TRUE
  `;
  const params: any[] = [];

  if (q) {
    const qNorm = `%${q.trim().replace(/\s+/g, ' ').toLowerCase()}%`;
    // A busca agora é feita com subquery para cursos, evitando o JOIN problemático
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

  // O GROUP BY não é mais necessário, pois a agregação é feita na subquery
  query += ' ORDER BY ISNULL(media_avaliacoes), media_avaliacoes DESC, i.nome ASC';

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows;
};

export const getCoursesByInstitution = async (institutionId?: number, q?: string) => {
  let query = 'SELECT id, nome FROM Cursos WHERE is_active = TRUE';
  const params = [];
  let whereClauses = [];

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

export const updateInstitution = async (institutionId: number, nome: string) => {
  const nomeNorm = String(nome).trim().replace(/\s+/g, ' ');
  await pool.query('UPDATE Instituicoes SET nome = ? WHERE id = ?', [nomeNorm, institutionId]);
  const [rows] = await pool.query<RowDataPacket[]>('SELECT id, nome FROM Instituicoes WHERE id = ?', [institutionId]);
  return rows[0];
};

export const updateCourse = async (courseId: number, nome: string) => {
  const nomeNorm = String(nome).trim().replace(/\s+/g, ' ');
  await pool.query('UPDATE Cursos SET nome = ? WHERE id = ?', [nomeNorm, courseId]);
  const [rows] = await pool.query<RowDataPacket[]>('SELECT id, nome FROM Cursos WHERE id = ?', [courseId]);
  return rows[0];
};

export const deleteInstitution = async (institutionId: number) => {
  const connection = await pool.getConnection();
  try {
    // Check for related records
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

export const deleteCourse = async (courseId: number) => {
  const connection = await pool.getConnection();
  try {
    // Check for related records
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

export const mergeInstitution = async (sourceInstitutionId: number, destinationInstitutionId: number) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Update related records
    await connection.query('UPDATE Usuarios SET instituicao_id = ? WHERE instituicao_id = ?', [destinationInstitutionId, sourceInstitutionId]);
    await connection.query('UPDATE Cursos SET instituicao_id = ? WHERE instituicao_id = ?', [destinationInstitutionId, sourceInstitutionId]);
    await connection.query('UPDATE Avaliacoes SET instituicao_id = ? WHERE instituicao_id = ?', [destinationInstitutionId, sourceInstitutionId]);

    // Delete the source institution
    await connection.query('DELETE FROM Instituicoes WHERE id = ?', [sourceInstitutionId]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const mergeCourse = async (sourceCourseId: number, destinationCourseId: number) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Update related records
    await connection.query('UPDATE Usuarios SET curso_id = ? WHERE curso_id = ?', [destinationCourseId, sourceCourseId]);
    await connection.query('UPDATE Avaliacoes SET curso_id = ? WHERE curso_id = ?', [destinationCourseId, sourceCourseId]);

    // Delete the source course
    await connection.query('DELETE FROM Cursos WHERE id = ?', [sourceCourseId]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Função para calcular a distância entre dois pontos usando a fórmula de Haversine
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Raio da Terra em quilômetros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getInstitutionsNearby = async (latitude: number, longitude: number, radius: number) => {
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
