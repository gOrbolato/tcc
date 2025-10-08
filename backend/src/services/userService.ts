
import pool from '../config/database';
import { OkPacket, RowDataPacket } from 'mysql2';

// --- Interfaces ---
interface UserDetails {
  instituicao_id?: number;
  curso_id?: number;
  is_active?: boolean;
}
interface UserProfileData {
  instituicao_id?: number;
  curso_id?: number;
  periodo?: string;
  ra?: string;
  is_active?: boolean; // Adicionado
}
// ------------------

// Para o admin editar um usuário
export const updateUserDetails = async (userId: number, details: UserDetails) => { /* ... */ };

// Para o próprio usuário buscar seu perfil
export const getUserById = async (userId: number) => { /* ... */ };

// Para o próprio usuário atualizar seu perfil
export const updateUserProfile = async (userId: number, data: UserProfileData) => {
  // Regra de Negócio: Permitir alteração apenas nos meses de rematrícula
  const currentMonth = new Date().getMonth(); // 0 = Jan, 1 = Fev, 6 = Jul, 7 = Ago
  const rematriculaMonths = [0, 1, 6, 7];
  if (!rematriculaMonths.includes(currentMonth)) {
    throw new Error('Alterações de perfil são permitidas apenas nos períodos de rematrícula (Jan/Fev e Jul/Ago).');
  }

  // Regra de negócio: RA só pode ser alterado se instituição E curso forem alterados.
  if (data.ra && (!data.instituicao_id || !data.curso_id)) {
    throw new Error('O RA só pode ser alterado juntamente com a instituição e o curso.');
  }

  const fields = [];
  const values = [];

  if (data.instituicao_id) { fields.push('instituicao_id = ?'); values.push(data.instituicao_id); }
  if (data.curso_id) { fields.push('curso_id = ?'); values.push(data.curso_id); }
  if (data.periodo) { fields.push('periodo = ?'); values.push(data.periodo); }
  if (data.ra) { fields.push('ra = ?'); values.push(data.ra); }
  if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active); } // Adicionado

  if (fields.length === 0) {
    return getUserById(userId); // Retorna o perfil atual se nada foi enviado para alteração
  }

  values.push(userId);

  const query = `UPDATE Usuarios SET ${fields.join(', ')} WHERE id = ?`;
  const [result] = await pool.query<OkPacket>(query, values);

  if (result.affectedRows === 0) {
    throw new Error('Usuário não encontrado.');
  }

  return getUserById(userId);
};
