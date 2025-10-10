import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

interface EvaluationFilters {
  institutionId?: string;
  courseId?: string;
  latitude?: string;
  longitude?: string;
  radius?: string;
}

// Para o painel de admin
export const getFilteredEvaluations = async (filters: EvaluationFilters) => {
  let query = `
    SELECT 
      a.id, a.media_final, a.criado_em, 
      i.nome AS instituicao_nome, 
      c.nome AS curso_nome,
      u.ra AS usuario_ra
      ${filters.latitude && filters.longitude ? ", ( 6371 * acos( cos( radians(?) ) * cos( radians( i.latitude ) ) * cos( radians( i.longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( i.latitude ) ) ) ) AS distance" : ""}
    FROM Avaliacoes a
    JOIN Instituicoes i ON a.instituicao_id = i.id
    JOIN Cursos c ON a.curso_id = c.id
    JOIN Usuarios u ON a.usuario_id = u.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (filters.latitude && filters.longitude) {
    params.push(Number(filters.latitude), Number(filters.longitude), Number(filters.latitude));
  }
  if (filters.institutionId) { query += ' AND a.instituicao_id = ?'; params.push(filters.institutionId); }
  if (filters.courseId) { query += ' AND a.curso_id = ?'; params.push(filters.courseId); }
  if (filters.latitude && filters.longitude && filters.radius) { query += ' HAVING distance < ?'; params.push(Number(filters.radius)); }

  query += ' ORDER BY a.criado_em DESC';

  const [evaluations] = await pool.query<RowDataPacket[]>(query, params);
  return evaluations;
};

// Para o dashboard do usuário
export const getEvaluationsByUserId = async (userId: number) => {
  const query = `
    SELECT 
      a.id, a.media_final, a.criado_em, 
      i.nome AS instituicao_nome, 
      c.nome AS curso_nome
    FROM Avaliacoes a 
    JOIN Instituicoes i ON a.instituicao_id = i.id 
    JOIN Cursos c ON a.curso_id = c.id 
    WHERE a.usuario_id = ? 
    ORDER BY a.criado_em DESC`;

  const [evaluations] = await pool.query<RowDataPacket[]>(query, [userId]);
  return evaluations;
};