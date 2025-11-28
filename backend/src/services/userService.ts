// Importa a pool de conexões do banco de dados.
import pool from '../config/database';
// Importa o tipo OkPacket do mysql2 para tipar os resultados de inserção/atualização.
import { OkPacket } from 'mysql2';
// Importa a tipagem de usuário.
import { UsuarioRow } from '../types/user';
// Importa a biblioteca bcrypt para hash de senhas.
import bcrypt from 'bcrypt';

// --- Interfaces ---
interface UserDetails { instituicao_id?: number; curso_id?: number; is_active?: boolean; }
interface UserProfileData { instituicao_id?: number; curso_id?: number; periodo?: string; previsaoTermino?: string; ra?: string; is_active?: boolean; }
// ------------------

/**
 * @function getAdminById
 * @description Busca um administrador pelo ID.
 * @param {number} adminId - O ID do administrador.
 * @returns {Promise<any>} - O objeto do administrador com a flag isAdmin.
 */
export const getAdminById = async (adminId: number): Promise<any> => {
  const [rows] = await pool.query<any[]>('SELECT id, nome, email FROM Admins WHERE id = ?', [adminId]);
  if (rows.length === 0) throw new Error('Administrador não encontrado.');
  return { ...rows[0], isAdmin: true };
};

/**
 * @function getUserById
 * @description Busca um usuário pelo ID, incluindo nomes de instituição e curso.
 * @param {number} userId - O ID do usuário.
 * @returns {Promise<any>} - O objeto do usuário com dados adicionais.
 */
export const getUserById = async (userId: number): Promise<any> => {
  const [rows] = await pool.query<any[]>(
    `SELECT u.id, u.nome, u.email, u.cpf, u.ra, u.instituicao_id, u.curso_id, u.periodo, u.semestre, u.previsao_termino, u.anonymized_id, u.is_active, u.is_trancado, u.desbloqueio_aprovado_em,
            i.nome AS instituicao_nome, c.nome AS curso_nome
     FROM Usuarios u
     LEFT JOIN Instituicoes i ON u.instituicao_id = i.id
     LEFT JOIN Cursos c ON u.curso_id = c.id
     WHERE u.id = ?`,
    [userId]
  );
  if (rows.length === 0) throw new Error('Usuário não encontrado.');
  return rows[0];
};

/**
 * @function updateUserProfile
 * @description Atualiza o perfil de um usuário, com regras de permissão para período de rematrícula ou janela de desbloqueio.
 * @param {number} userId - O ID do usuário.
 * @param {UserProfileData} data - Os dados a serem atualizados.
 * @param {object} [options] - Opções adicionais, como permitir override de admin.
 * @returns {Promise<any>} - O perfil do usuário atualizado.
 */
export const updateUserProfile = async (userId: number, data: UserProfileData, options?: { allowAdminOverride?: boolean }): Promise<any> => {
  const allowAdminOverride = options?.allowAdminOverride === true;
  const user = await getUserById(userId);

  let isWithinUnlockWindow = false;
  if (user.desbloqueio_aprovado_em) {
    const tenDaysLater = new Date(user.desbloqueio_aprovado_em);
    tenDaysLater.setDate(tenDaysLater.getDate() + 10);
    isWithinUnlockWindow = new Date() < tenDaysLater;
  }

  if (!allowAdminOverride) {
    const rematriculaMonths = [0, 1, 6, 7]; // Jan, Fev, Jul, Ago
    if (!rematriculaMonths.includes(new Date().getMonth()) && !isWithinUnlockWindow) {
      throw new Error('Alterações de perfil são permitidas apenas nos períodos de rematrícula ou em até 10 dias após o desbloqueio do curso.');
    }
    if (data.ra && (!data.instituicao_id || !data.curso_id)) {
      throw new Error('O RA só pode ser alterado juntamente com a instituição e o curso.');
    }
  }

  const fields: string[] = [];
  const values: (string | number | boolean)[] = [];

  if (isWithinUnlockWindow) fields.push('desbloqueio_aprovado_em = NULL');

  if ((data as any).nome) { fields.push('nome = ?'); values.push((data as any).nome); }
  if ((data as any).email) {
    const [existingEmail] = await pool.query<UsuarioRow[]>('SELECT id FROM Usuarios WHERE email = ? AND id <> ?', [(data as any).email, userId]);
    if (existingEmail.length > 0) throw new Error('E-mail já cadastrado por outro usuário.');
    fields.push('email = ?');
    values.push((data as any).email);
  }
  if (data.instituicao_id) { fields.push('instituicao_id = ?'); values.push(data.instituicao_id); }
  if (data.curso_id) { fields.push('curso_id = ?'); values.push(data.curso_id); }
  if (data.periodo) { fields.push('periodo = ?'); values.push(data.periodo); }
  if (data.previsaoTermino) { fields.push('previsao_termino = ?'); values.push(data.previsaoTermino); }
  if (data.ra) { fields.push('ra = ?'); values.push(data.ra); }
  if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active); }

  if (fields.length === 0) return getUserById(userId);

  values.push(userId);
  const query = `UPDATE Usuarios SET ${fields.join(', ')} WHERE id = ?`;
  await pool.query<OkPacket>(query, values);
  return getUserById(userId);
};

/**
 * @function updateUserDetails
 * @description Atualiza detalhes específicos de um usuário (usado por admins).
 * @param {number} userId - O ID do usuário.
 * @param {UserDetails} details - Os detalhes a serem atualizados.
 * @returns {Promise<any>} - O perfil do usuário atualizado.
 */
export const updateUserDetails = async (userId: number, details: UserDetails): Promise<any> => {
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

/**
 * @function changePassword
 * @description Altera a senha de um usuário, verificando a senha antiga.
 * @param {number} userId - O ID do usuário.
 * @param {string} oldPassword - A senha antiga.
 * @param {string} newPassword - A nova senha.
 * @returns {Promise<boolean>} - True se a senha for alterada com sucesso.
 */
export const changePassword = async (userId: number, oldPassword: string, newPassword: string): Promise<boolean> => {
  const [rows] = await pool.query<UsuarioRow[]>('SELECT senha FROM Usuarios WHERE id = ?', [userId]);
  if (rows.length === 0) throw new Error('Usuário não encontrado.');
  
  if (!await bcrypt.compare(oldPassword, rows[0].senha)) throw new Error('Senha antiga incorreta.');
  if (newPassword.length < 8) throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
  
  const hashed = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE Usuarios SET senha = ? WHERE id = ?', [hashed, userId]);
  return true;
};

/**
 * @function adminChangePassword
 * @description Permite que um administrador altere a senha de um usuário sem a senha antiga.
 * @param {number} userId - O ID do usuário.
 * @param {string} newPassword - A nova senha.
 * @returns {Promise<boolean>} - True se a senha for alterada com sucesso.
 */
export const adminChangePassword = async (userId: number, newPassword: string): Promise<boolean> => {
  if (newPassword.length < 8) throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
  const hashed = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE Usuarios SET senha = ? WHERE id = ?', [hashed, userId]);
  return true;
};

/**
 * @function trancarCurso
 * @description Marca o curso de um usuário como trancado.
 * @param {number} userId - O ID do usuário.
 * @param {string} motivo - O motivo do trancamento.
 * @returns {Promise<any>} - O perfil do usuário atualizado.
 */
export const trancarCurso = async (userId: number, motivo: string): Promise<any> => {
  const [result] = await pool.query<OkPacket>('UPDATE Usuarios SET is_trancado = TRUE, motivo_trancamento = ? WHERE id = ?', [motivo, userId]);
  if (result.affectedRows === 0) throw new Error('Usuário não encontrado.');
  return getUserById(userId);
};

/**
 * @function requestDesbloqueio
 * @description Cria uma nova solicitação de desbloqueio para um usuário.
 * @param {number} userId - O ID do usuário.
 * @param {string} [motivo] - O motivo da solicitação.
 * @returns {Promise<any>} - O objeto da solicitação de desbloqueio criada.
 */
export const requestDesbloqueio = async (userId: number, motivo?: string): Promise<any> => {
  const [result] = await pool.query<OkPacket>('INSERT INTO Desbloqueios (usuario_id, motivo) VALUES (?, ?)', [userId, motivo || null]);
  return { id: result.insertId, usuario_id: userId, status: 'PENDING' };
};