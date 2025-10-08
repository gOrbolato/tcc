import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

interface UserFilters {
  ra?: string;
  institutionId?: string;
  courseId?: string;
}

export const getFilteredUsers = async (filters: UserFilters) => {
  let query = `
    SELECT u.id, u.nome, u.email, u.ra, u.is_active, u.instituicao_id, u.curso_id 
    FROM Usuarios u 
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (filters.ra) {
    query += ' AND u.ra LIKE ?';
    params.push(`%${filters.ra}%`);
  }
  if (filters.institutionId) {
    query += ' AND u.instituicao_id = ?';
    params.push(filters.institutionId);
  }
  if (filters.courseId) {
    query += ' AND u.curso_id = ?';
    params.push(filters.courseId);
  }

  query += ' ORDER BY u.nome ASC';

  const [users] = await pool.query<RowDataPacket[]>(query, params);
  return users;
};