import pool from '../config/database';
import { RowDataPacket, OkPacket } from 'mysql2';

interface UserFilters {
  ra?: string;
  q?: string;
  institutionId?: string;
  courseId?: string;
  anonymizedId?: string;
}

export const getFilteredUsers = async (filters: UserFilters) => {
  // Select user fields plus institution/curso names and average rating
  let query = `
    SELECT 
      u.id, u.nome, u.email, u.ra, u.is_active, u.instituicao_id, u.curso_id, u.anonymized_id,
      i.nome AS instituicao_nome, c.nome AS curso_nome,
      AVG(a.media_final) AS media_avaliacoes
    FROM Usuarios u
    LEFT JOIN Instituicoes i ON u.instituicao_id = i.id
    LEFT JOIN Cursos c ON u.curso_id = c.id
    LEFT JOIN Avaliacoes a ON a.usuario_id = u.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (filters.ra) {
    query += ' AND u.ra LIKE ?';
    params.push(`%${filters.ra}%`);
  }
  if (filters.q) {
    query += ' AND (u.nome LIKE ? OR u.email LIKE ?)';
    params.push(`%${filters.q}%`, `%${filters.q}%`);
  }
  if (filters.institutionId) {
    query += ' AND u.instituicao_id = ?';
    params.push(Number(filters.institutionId));
  }
  if (filters.courseId) {
    query += ' AND u.curso_id = ?';
    params.push(Number(filters.courseId));
  }
  if (filters.anonymizedId) {
    query += ' AND u.anonymized_id = ?';
    params.push(filters.anonymizedId);
  }

  query += ' GROUP BY u.id';
  const [users] = await pool.query<RowDataPacket[]>(query, params);
  return users;
};

export const deleteUser = async (userId: number) => {
  const [result] = await pool.query<OkPacket>('DELETE FROM Usuarios WHERE id = ?', [userId]);
  if (result.affectedRows === 0) {
    throw new Error('Usuário não encontrado.');
  }
};