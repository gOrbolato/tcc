import pool from '../config/database';
import { OkPacket } from 'mysql2';
import { UsuarioRow } from '../types/user';
import bcrypt from 'bcrypt';

// --- Interfaces ---
interface UserDetails { instituicao_id?: number; curso_id?: number; is_active?: boolean; }
interface UserProfileData { instituicao_id?: number; curso_id?: number; periodo?: string; previsaoTermino?: string; ra?: string; is_active?: boolean; }
// ------------------

export const getAdminById = async (adminId: number) => {
  const [rows] = await pool.query<any[]>(
    'SELECT id, nome, email FROM Admins WHERE id = ?',
    [adminId]
  );
  if (rows.length === 0) {
    throw new Error('Administrador não encontrado.');
  }
  return { ...rows[0], isAdmin: true };
};

export const getUserById = async (userId: number) => {
  const [rows] = await pool.query<any[]>(
    `SELECT u.id, u.nome, u.email, u.cpf, u.ra, u.instituicao_id, u.curso_id, u.periodo, u.semestre, u.previsao_termino, u.anonymized_id, u.is_active, u.is_trancado, u.desbloqueio_aprovado_em,
            i.nome AS instituicao_nome, c.nome AS curso_nome
     FROM Usuarios u
     LEFT JOIN Instituicoes i ON u.instituicao_id = i.id
     LEFT JOIN Cursos c ON u.curso_id = c.id
     WHERE u.id = ?`,
    [userId]
  );
  if (rows.length === 0) {
    throw new Error('Usuário não encontrado.');
  }
  return rows[0];
};

export const updateUserProfile = async (userId: number, data: UserProfileData, options?: { allowAdminOverride?: boolean }) => {
  const allowAdminOverride = options?.allowAdminOverride === true;

  // Fetch the user to check their unlock status
  const user = await getUserById(userId);
  let isWithinUnlockWindow = false;
  if (user.desbloqueio_aprovado_em) {
    const approvalDate = new Date(user.desbloqueio_aprovado_em);
    const tenDaysLater = new Date(approvalDate);
    tenDaysLater.setDate(tenDaysLater.getDate() + 10);
    if (new Date() < tenDaysLater) {
      isWithinUnlockWindow = true;
    }
  }

  if (!allowAdminOverride) {
    const currentMonth = new Date().getMonth();
    const rematriculaMonths = [0, 1, 6, 7]; // Jan, Fev, Jul, Ago
    const isRematriculaPeriod = rematriculaMonths.includes(currentMonth);

    if (!isRematriculaPeriod && !isWithinUnlockWindow) {
      throw new Error('Alterações de perfil são permitidas apenas nos períodos de rematrícula ou em até 10 dias após o desbloqueio do curso.');
    }

    if (data.ra && (!data.instituicao_id || !data.curso_id)) {
      throw new Error('O RA só pode ser alterado juntamente com a instituição e o curso.');
    }
  }

  const fields: string[] = [];
  const values: (string | number | boolean)[] = [];

  // If the update is happening within the unlock window, clear the approval date
  if (isWithinUnlockWindow) {
    fields.push('desbloqueio_aprovado_em = NULL');
  }

  // Allow updating name and email as well
  if ((data as any).nome) {
    fields.push('nome = ?');
    values.push((data as any).nome);
  }
  if ((data as any).email) {
    // check uniqueness
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

export const changePassword = async (userId: number, oldPassword: string, newPassword: string) => {
  const [rows] = await pool.query<UsuarioRow[]>('SELECT senha FROM Usuarios WHERE id = ?', [userId]);
  if (rows.length === 0) throw new Error('Usuário não encontrado.');
  const user = rows[0];
  const isValid = await bcrypt.compare(oldPassword, user.senha);
  if (!isValid) throw new Error('Senha antiga incorreta.');
  if (newPassword.length < 8) throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
  const hashed = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE Usuarios SET senha = ? WHERE id = ?', [hashed, userId]);
  return true;
};

export const adminChangePassword = async (userId: number, newPassword: string) => {
  if (newPassword.length < 8) throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
  const hashed = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE Usuarios SET senha = ? WHERE id = ?', [hashed, userId]);
  return true;
};

export const trancarCurso = async (userId: number, motivo: string) => {
  const [result] = await pool.query<OkPacket>('UPDATE Usuarios SET is_trancado = TRUE, motivo_trancamento = ? WHERE id = ?', [motivo, userId]);
  if (result.affectedRows === 0) throw new Error('Usuário não encontrado.');
  return getUserById(userId);
};

export const requestDesbloqueio = async (userId: number, motivo?: string) => {
  const [result] = await pool.query<OkPacket>('INSERT INTO Desbloqueios (usuario_id, motivo) VALUES (?, ?)', [userId, motivo || null]);
  return { id: result.insertId, usuario_id: userId, status: 'PENDING' };
};