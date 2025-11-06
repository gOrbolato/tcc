import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

export const getAllInstitutions = async (q?: string) => {
  let query = 'SELECT id, nome, latitude, longitude FROM Instituicoes WHERE is_active = TRUE';
  const params = [];
  if (q) {
    query += ' AND nome LIKE ?';
    params.push(`%${q}%`);
  }
  query += ' ORDER BY nome ASC';
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
    whereClauses.push('nome LIKE ?');
    params.push(`%${q}%`);
  }

  if (whereClauses.length > 0) {
    query += ` AND ${whereClauses.join(' AND ')}`;
  }

  query += ' ORDER BY nome ASC';
  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows;
};

export const updateInstitution = async (institutionId: number, nome: string) => {
  await pool.query('UPDATE Instituicoes SET nome = ? WHERE id = ?', [nome, institutionId]);
  const [rows] = await pool.query<RowDataPacket[]>('SELECT id, nome FROM Instituicoes WHERE id = ?', [institutionId]);
  return rows[0];
};

export const updateCourse = async (courseId: number, nome: string) => {
  await pool.query('UPDATE Cursos SET nome = ? WHERE id = ?', [nome, courseId]);
  const [rows] = await pool.query<RowDataPacket[]>('SELECT id, nome FROM Cursos WHERE id = ?', [courseId]);
  return rows[0];
};

export const deleteInstitution = async (institutionId: number) => {
  await pool.query('UPDATE Instituicoes SET is_active = FALSE WHERE id = ?', [institutionId]);
};

export const deleteCourse = async (courseId: number) => {
  await pool.query('UPDATE Cursos SET is_active = FALSE WHERE id = ?', [courseId]);
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
      AVG(a.media_final) AS average_media_final
    FROM Instituicoes i
    LEFT JOIN Avaliacoes a ON i.id = a.instituicao_id
    WHERE i.is_active = TRUE AND i.latitude IS NOT NULL AND i.longitude IS NOT NULL
    GROUP BY i.id, i.nome, i.latitude, i.longitude
    HAVING average_media_final IS NOT NULL
    ORDER BY average_media_final DESC`
  );

  const nearbyInstitutions = institutions.filter(inst => {
    if (inst.latitude && inst.longitude) {
      const distance = haversineDistance(latitude, longitude, inst.latitude, inst.longitude);
      return distance <= radius;
    }
    return false;
  });

  // Ordenar novamente por média final decrescente (já está na query, mas para garantir após o filtro)
  nearbyInstitutions.sort((a, b) => (b.average_media_final || 0) - (a.average_media_final || 0));

  return nearbyInstitutions;
};
