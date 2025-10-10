import pool from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OkPacket, RowDataPacket } from 'mysql2';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_jwt_aqui';

export const register = async (userData: any) => {
  const { nome, cpf, ra, idade, email, senha, instituicao_id, curso_id, periodo, semestre } = userData;

  const [existingUserByCpf] = await pool.query<RowDataPacket[]>('SELECT * FROM Usuarios WHERE cpf = ?', [cpf]);
  const hashedPassword = await bcrypt.hash(senha, 10);

  if (existingUserByCpf.length > 0) {
    const userId = existingUserByCpf[0].id;
    const [otherUserByEmail] = await pool.query<RowDataPacket[]>('SELECT id FROM Usuarios WHERE email = ? AND cpf != ?', [email, cpf]);
    if (otherUserByEmail.length > 0) throw new Error('Este e-mail já está em uso por outra conta.');

    const query = `UPDATE Usuarios SET nome = ?, ra = ?, idade = ?, email = ?, senha = ?, instituicao_id = ?, curso_id = ?, periodo = ?, semestre = ?, is_active = TRUE WHERE id = ?;`;
    await pool.query(query, [nome, ra, idade, email, hashedPassword, instituicao_id, curso_id, periodo, semestre, userId]);
    
    const [updatedUser] = await pool.query<RowDataPacket[]>('SELECT id, nome, email FROM Usuarios WHERE id = ?', [userId]);
    return updatedUser[0];
  } else {
    const [existingByEmail] = await pool.query<RowDataPacket[]>('SELECT id FROM Usuarios WHERE email = ?', [email]);
    if (existingByEmail.length > 0) throw new Error('E-mail já cadastrado.');

    const [existingByRa] = await pool.query<RowDataPacket[]>('SELECT id FROM Usuarios WHERE ra = ? AND instituicao_id = ?', [ra, instituicao_id]);
    if (existingByRa.length > 0) throw new Error('RA já cadastrado para esta instituição.');

    const query = `INSERT INTO Usuarios (nome, cpf, ra, idade, email, senha, instituicao_id, curso_id, periodo, semestre) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
    const [result] = await pool.query<OkPacket>(query, [nome, cpf, ra, idade, email, hashedPassword, instituicao_id, curso_id, periodo, semestre]);
    
    const [newUser] = await pool.query<RowDataPacket[]>('SELECT id, nome, email FROM Usuarios WHERE id = ?', [result.insertId]);
    return newUser[0];
  }
};

export const login = async (email: string, senha: string) => {
  const [adminRows] = await pool.query<RowDataPacket[]>('SELECT * FROM Admins WHERE email = ?', [email]);
  if (adminRows.length > 0) {
    const admin = adminRows[0];
    const isPasswordValid = await bcrypt.compare(senha, admin.senha);
    if (isPasswordValid) {
      const token = jwt.sign({ id: admin.id, nome: admin.nome, isAdmin: true }, JWT_SECRET, { expiresIn: '1h' });
      return { token, user: { id: admin.id, nome: admin.nome, email: admin.email, isAdmin: true } };
    }
  }

  const [userRows] = await pool.query<RowDataPacket[]>('SELECT * FROM Usuarios WHERE email = ?', [email]);
  if (userRows.length > 0) {
    const user = userRows[0];
    if (!user.is_active) {
      throw new Error('Sua conta está trancada e não pode ser acessada.');
    }
    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (isPasswordValid) {
      const token = jwt.sign({ id: user.id, nome: user.nome, isAdmin: false, is_active: user.is_active }, JWT_SECRET, { expiresIn: '1h' });
      return { token, user: { id: user.id, nome: user.nome, email: user.email, isAdmin: false, is_active: user.is_active } };
    }
  }

  throw new Error('E-mail ou senha inválidos.');
};

export const forgotPassword = async (email: string) => {
  const [users] = await pool.query<RowDataPacket[]>('SELECT id FROM Usuarios WHERE email = ?', [email]);
  if (users.length === 0) {
    console.warn(`Tentativa de recuperação de senha para e-mail não cadastrado: ${email}`);
    return;
  }
  const user = users[0];
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiresAt = new Date(Date.now() + 3600000);
  await pool.query('UPDATE Usuarios SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?', [resetToken, resetTokenExpiresAt, user.id]);
  console.log(`Link de recuperação para ${email}: http://localhost:5173/resetar-senha/${resetToken}`);
  return resetToken;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const [users] = await pool.query<RowDataPacket[]>('SELECT id, reset_token_expires_at FROM Usuarios WHERE reset_token = ?', [token]);
  if (users.length === 0 || users[0].reset_token_expires_at < new Date()) {
    throw new Error('Token de redefinição de senha inválido ou expirado.');
  }
  const user = users[0];
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE Usuarios SET senha = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?', [hashedPassword, user.id]);
};