import pool from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OkPacket, RowDataPacket } from 'mysql2';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_jwt_aqui';

export const register = async (userData: any) => {
  const { nome, cpf, ra, idade, email, senha, instituicao_id, curso_id, periodo, semestre } = userData;

  const [existingUsers] = await pool.query<RowDataPacket[]>('SELECT * FROM Usuarios WHERE email = ? OR cpf = ? OR ra = ?', [email, cpf, ra]);
  if (existingUsers.length > 0) {
    throw new Error('E-mail, CPF ou RA já cadastrado.');
  }

  const hashedPassword = await bcrypt.hash(senha, 10);

  const [result] = await pool.query<OkPacket>(
    'INSERT INTO Usuarios (nome, cpf, ra, idade, email, senha, instituicao_id, curso_id, periodo, semestre) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [nome, cpf, ra, idade, email, hashedPassword, instituicao_id, curso_id, periodo, semestre]
  );

  const [newUser] = await pool.query<RowDataPacket[]>('SELECT id, nome, email FROM Usuarios WHERE id = ?', [result.insertId]);
  return newUser[0];
};

export const login = async (email: string, senha: string) => {
  const [users] = await pool.query<RowDataPacket[]>('SELECT * FROM Usuarios WHERE email = ?', [email]);
  if (users.length === 0) {
    throw new Error('Usuário ou senha inválidos.');
  }

  const user = users[0];
  const isPasswordValid = await bcrypt.compare(senha, user.senha);
  if (!isPasswordValid) {
    throw new Error('Usuário ou senha inválidos.');
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

  return { token, user: { id: user.id, nome: user.nome, email: user.email } };
};

export const forgotPassword = async (email: string) => {
  const [users] = await pool.query<RowDataPacket[]>('SELECT id FROM Usuarios WHERE email = ?', [email]);
  if (users.length === 0) {
    throw new Error('Usuário não encontrado com este e-mail.');
  }

  const user = users[0];
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiresAt = new Date(Date.now() + 3600000); // 1 hora de validade

  await pool.query('UPDATE Usuarios SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?', [resetToken, resetTokenExpiresAt, user.id]);

  // Em uma aplicação real, este token seria enviado por e-mail ao usuário.
  // Por enquanto, vamos retorná-lo para facilitar o teste.
  return resetToken;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const [users] = await pool.query<RowDataPacket[]>('SELECT id, reset_token_expires_at FROM Usuarios WHERE reset_token = ?', [token]);
  if (users.length === 0) {
    throw new Error('Token de redefinição de senha inválido ou expirado.');
  }

  const user = users[0];
  if (user.reset_token_expires_at < new Date()) {
    throw new Error('Token de redefinição de senha expirado.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await pool.query('UPDATE Usuarios SET senha = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?', [hashedPassword, user.id]);
};
