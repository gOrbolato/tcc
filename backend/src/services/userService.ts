import pool from '../config/database';
import { OkPacket, RowDataPacket } from 'mysql2';

// --- Interfaces ---
interface UserDetails { instituicao_id?: number; curso_id?: number; is_active?: boolean; }
interface UserProfileData { instituicao_id?: number; curso_id?: number; periodo?: string; ra?: string; is_active?: boolean; }
// ------------------

export const getAdminById = async (adminId: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, nome, email FROM Admins WHERE id = ?',
    [adminId]
  );
  if (rows.length === 0) {
    throw new Error('Administrador não encontrado.');
  }
  return { ...rows[0], isAdmin: true };
};

export const getUserById = async (userId: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, nome, email, cpf, ra, idade, instituicao_id, curso_id, periodo, semestre, is_active FROM Usuarios WHERE id = ?',
    [userId]
  );
  if (rows.length === 0) {
    throw new Error('Usuário não encontrado.');
  }
  return rows[0];
};

export const updateUserProfile = async (userId: number, data: UserProfileData) => {
  const currentMonth = new Date().getMonth();
  const rematriculaMonths = [0, 1, 6, 7]; // Jan, Fev, Jul, Ago
  if (!rematriculaMonths.includes(currentMonth)) {
    throw new Error('Alterações de perfil são permitidas apenas nos períodos de rematrícula (Jan/Fev e Jul/Ago).');
  }

  if (data.ra && (!data.instituicao_id || !data.curso_id)) {
    throw new Error('O RA só pode ser alterado juntamente com a instituição e o curso.');
  }

  const fields: string[] = [];
  const values: (string | number | boolean)[] = [];

  if (data.instituicao_id) { fields.push('instituicao_id = ?'); values.push(data.instituicao_id); }
  if (data.curso_id) { fields.push('curso_id = ?'); values.push(data.curso_id); }
  if (data.periodo) { fields.push('periodo = ?'); values.push(data.periodo); }
  if (data.ra) { fields.push('ra = ?'); values.push(data.ra); }
  if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active); }

  if (fields.length === 0) {
    return getUserById(userId);
  }

  values.push(userId);
  const query = `UPDATE Usuarios SET ${fields.join(', ')} WHERE id = ?`;
  const [result] = await pool.query<OkPacket>(query, values);

  if (result.affectedRows === 0) {
    throw new Error('Usuário não encontrado ao tentar atualizar.');
  }
  return getUserById(userId);
};

export const updateUserDetails = async (userId: number, details: UserDetails) => {
  const fields: string[] = [];
  const values: (string | number | boolean)[] = [];

  if (details.instituicao_id !== undefined) { fields.push('instituicao_id = ?'); values.push(details.instituicao_id); }
  if (details.curso_id !== undefined) { fields.push('curso_id = ?'); values.push(details.curso_id); }
  if (details.is_active !== undefined) { fields.push('is_active = ?'); values.push(details.is_active); }

  if (fields.length === 0) throw new Error('Nenhum dado para atualizar.');

  values.push(userId);
  const query = `UPDATE Usuarios SET ${fields.join(', ')} WHERE id = ?`;
  const [result] = await pool.query<OkPacket>(query, values);

  if (result.affectedRows === 0) throw new Error('Usuário não encontrado ao tentar atualizar.');
  
  return getUserById(userId);
};