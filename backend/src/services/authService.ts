import pool from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OkPacket, RowDataPacket } from 'mysql2';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_jwt_aqui';

// Função auxiliar para gerar um código de 3 letras e 4 números
const generateRandomCode = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 4; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
};

// Placeholder para envio de e-mail (substituir por um serviço real)
const sendEmail = async (to: string, subject: string, text: string) => {
  console.log(`
--- SIMULANDO ENVIO DE E-MAIL ---
Para: ${to}
Assunto: ${subject}
Corpo: ${text}
----------------------------------
`);
  // Aqui você integraria um serviço de envio de e-mail real (ex: Nodemailer, SendGrid)
};

export const register = async (userData: any) => {
  // ... (código existente) ...
};

interface LoginResult {
  token: string;
  user: { id: number; nome: string; email: string; isAdmin: boolean; is_active?: boolean; };
}

export const login = async (email: string, senha: string): Promise<LoginResult> => {
  const [adminRows] = await pool.query<RowDataPacket[]>('SELECT * FROM Admins WHERE email = ?', [email]);
  if (adminRows.length > 0) {
    const admin = adminRows[0];
    const isPasswordValid = await bcrypt.compare(senha, admin.senha);
    if (isPasswordValid) {
      const token = jwt.sign({ id: admin.id, nome: admin.nome, isAdmin: true }, JWT_SECRET, { expiresIn: '1h' });
      return { token, user: { id: admin.id, nome: admin.nome, email: admin.email, isAdmin: true } };
    } else {
      throw new Error('E-mail ou senha inválidos.');
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
    } else {
      throw new Error('E-mail ou senha inválidos.');
    }
  }

  throw new Error('E-mail ou senha inválidos.');
};

export const forgotPassword = async (email: string) => {
  const [users] = await pool.query<RowDataPacket[]>('SELECT id FROM Usuarios WHERE email = ?', [email]);
  if (users.length === 0) {
    console.warn(`Tentativa de recuperação de senha para e-mail não cadastrado: ${email}`);
    throw new Error('E-mail não encontrado.'); // Retorna erro para o frontend
  }
  const user = users[0];
  const resetCode = generateRandomCode();
  const resetTokenExpiresAt = new Date(Date.now() + 300000); // 5 minutos de validade
  await pool.query('UPDATE Usuarios SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?', [resetCode, resetTokenExpiresAt, user.id]);
  
  // Enviar e-mail com o código
  await sendEmail(email, 'Código de Recuperação de Senha', `Seu código de recuperação de senha é: ${resetCode}. Ele é válido por 5 minutos.`);
  
  return true; // Indica que o processo foi iniciado
};

export const validateResetCode = async (email: string, code: string) => {
  const [users] = await pool.query<RowDataPacket[]>('SELECT id, reset_token, reset_token_expires_at FROM Usuarios WHERE email = ?', [email]);
  if (users.length === 0) {
    throw new Error('E-mail não encontrado.');
  }
  const user = users[0];
  if (user.reset_token === code && user.reset_token_expires_at > new Date()) {
    return true; // Código válido
  }
  throw new Error('Código inválido ou expirado.');
};

export const resetPassword = async (email: string, newPassword: string) => {
  const [users] = await pool.query<RowDataPacket[]>('SELECT id, reset_token_expires_at FROM Usuarios WHERE email = ?', [email]);
  if (users.length === 0) {
    throw new Error('E-mail não encontrado.');
  }
  const user = users[0];
  // Verifica se o token ainda é válido (já foi validado antes, mas é uma segurança extra)
  if (!user.reset_token || user.reset_token_expires_at < new Date()) {
    throw new Error('Token de redefinição de senha inválido ou expirado.');
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE Usuarios SET senha = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?', [hashedPassword, user.id]);
  return true;
};