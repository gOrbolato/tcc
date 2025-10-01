import pool from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RowDataPacket, OkPacket } from 'mysql2';
import crypto from 'crypto';

export const registerUser = async (userData: any) => {
  const { nome, cpf, ra, idade, email, senha, instituicao_id, curso_id, periodo, semestre } = userData;
  const hashedPassword = await bcrypt.hash(senha, 10);
  const [result] = await pool.query<OkPacket>(
    'INSERT INTO Usuarios (nome, cpf, ra, idade, email, senha, instituicao_id, curso_id, periodo, semestre) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [nome, cpf, ra, idade, email, hashedPassword, instituicao_id, curso_id, periodo, semestre]
  );
  return { id: result.insertId, ...userData };
};

// FUNÇÃO DE LOGIN UNIFICADA
export const loginUser = async (email: string, senha: string) => {
  // 1. Tenta encontrar um Admin primeiro
  const [adminRows] = await pool.query<RowDataPacket[]>('SELECT * FROM Admins WHERE email = ?', [email]);

  if (adminRows.length > 0) {
    const admin = adminRows[0];
    const isPasswordValid = await bcrypt.compare(senha, admin.senha);
    if (isPasswordValid) {
      const token = jwt.sign(
        { id: admin.id, nome: admin.nome, isAdmin: true },
        process.env.JWT_SECRET || 'seu_segredo_jwt',
        { expiresIn: '1h' }
      );
      return { token, user: { id: admin.id, nome: admin.nome, email: admin.email, isAdmin: true } };
    }
  }

  // 2. Se não for admin, tenta encontrar um Usuário comum
  const [userRows] = await pool.query<RowDataPacket[]>('SELECT * FROM Usuarios WHERE email = ?', [email]);

  if (userRows.length > 0) {
    const user = userRows[0];
    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (isPasswordValid) {
      const token = jwt.sign(
        { id: user.id, nome: user.nome, isAdmin: false },
        process.env.JWT_SECRET || 'seu_segredo_jwt',
        { expiresIn: '1h' }
      );
      return { token, user: { id: user.id, nome: user.nome, email: user.email, isAdmin: false } };
    }
  }

  // 3. Se não encontrou ninguém ou a senha estava errada
  throw new Error('E-mail ou senha inválidos.');
};

export const forgotPassword = async (email: string) => {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM Usuarios WHERE email = ?', [email]);
  if (rows.length === 0) {
    // Não retorne erro para não revelar se um e-mail está cadastrado
    console.log(`Tentativa de recuperação de senha para e-mail não cadastrado: ${email}`);
    return;
  }
  const user = rows[0];

  // Gera um token seguro
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Define um tempo de expiração (ex: 10 minutos)
  const tokenExpires = new Date(Date.now() + 10 * 60 * 1000);

  // Salva o token hashado no banco de dados
  await pool.query(
    'UPDATE Usuarios SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?',
    [hashedToken, tokenExpires, user.id]
  );

  // Em um projeto real, você enviaria o e-mail aqui.
  // Por agora, vamos apenas logar o link no console para testes.
  const resetURL = `http://localhost:5173/resetar-senha/${resetToken}`;
  console.log('Link para redefinir a senha:', resetURL);
};

export const resetPassword = async (token: string, novaSenha: string) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM Usuarios WHERE reset_token = ? AND reset_token_expires_at > NOW()',
    [hashedToken]
  );

  if (rows.length === 0) {
    throw new Error('Token inválido ou expirado.');
  }
  const user = rows[0];

  const hashedPassword = await bcrypt.hash(novaSenha, 10);

  await pool.query(
    'UPDATE Usuarios SET senha = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?',
    [hashedPassword, user.id]
  );
};