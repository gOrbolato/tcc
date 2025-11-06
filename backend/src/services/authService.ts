import pool from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OkPacket, RowDataPacket } from 'mysql2';
import { UsuarioRow } from '../types/user';
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
  console.log('--- SIMULANDO ENVIO DE E-MAIL ---');
  console.log(`Para: ${to}`);
  console.log(`Assunto: ${subject}`);
  console.log('Corpo: ' + text);
  console.log('----------------------------------');
};

export const register = async (userData: any) => {
  console.log('--- INICIANDO PROCESSO DE REGISTRO ---');
  const {
    nome,
    cpf,
    ra,
    email,
    senha,
    instituicao_id,
    curso_id,
    institutionText,
    courseText,
    periodo,
    semestre,
    previsaoTermino,
  } = userData;

  // Verificações básicas
  if (!nome || !email || !senha || !ra) {
    throw new Error('Campos obrigatórios ausentes.');
  }

  // Checar CPF e e-mail únicos
  const [cpfRows] = await pool.query<RowDataPacket[]>('SELECT id FROM Usuarios WHERE cpf = ?', [cpf]);
  if (cpf && cpfRows.length > 0) {
    throw new Error('CPF já cadastrado.');
  }
  const [emailRows] = await pool.query<RowDataPacket[]>('SELECT id FROM Usuarios WHERE email = ?', [email]);
  if (emailRows.length > 0) {
    throw new Error('E-mail já cadastrado.');
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(senha, 10);

  // Resolver instituição e curso: se institutionText/courseText fornecidos, tentar encontrar por nome ou criar
  let finalInstituicaoId = instituicao_id;
  let finalCursoId = curso_id;

  // If institutionText/courseText provided, try to find matching records by name but DO NOT create new ones.
  if (!finalInstituicaoId && institutionText) {
    const [instRows] = await pool.query<RowDataPacket[]>('SELECT id FROM Instituicoes WHERE nome = ?', [institutionText]);
    if (instRows.length > 0) finalInstituicaoId = instRows[0].id;
    // else: leave as undefined/null (do not create automatically)
  }

  if (!finalCursoId && courseText && finalInstituicaoId) {
    const [cursoRows] = await pool.query<RowDataPacket[]>('SELECT id FROM Cursos WHERE nome = ? AND instituicao_id = ?', [courseText, finalInstituicaoId]);
    if (cursoRows.length > 0) finalCursoId = cursoRows[0].id;
    // else: leave as undefined/null (do not create automatically)
  }

  // Gerar anonymized_id
  const anonymizedId = crypto.randomBytes(16).toString('hex');

  // Inserir usuário
  const [insertResult] = await pool.query<OkPacket>(
    `INSERT INTO Usuarios (nome, cpf, ra, email, senha, instituicao_id, curso_id, periodo, semestre, previsao_termino, anonymized_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [nome, cpf || null, ra, email, hashedPassword, finalInstituicaoId || null, finalCursoId || null, periodo || null, semestre || null, previsaoTermino || null, anonymizedId]
  );

  const newUserId = insertResult.insertId;
  const [newUsers] = await pool.query<RowDataPacket[]>('SELECT id, nome, cpf, ra, email, instituicao_id, curso_id, periodo, semestre, previsao_termino, anonymized_id, is_active, criado_em FROM Usuarios WHERE id = ?', [newUserId]);
  const createdUser = newUsers[0];
  return createdUser;
};

interface UserPublic {
  id: number;
  nome: string;
  email: string;
  ra: string;
  instituicao_id: number | null;
  curso_id: number | null;
  periodo: string | null;
  semestre: string | null;
  previsao_termino: string | null;
  is_active: boolean;
  isAdmin: boolean;
  desbloqueio_aprovado_em: Date | null;
  instituicao_nome?: string;
  curso_nome?: string;
}

interface LoginResult {
  token: string;
  user: UserPublic;
}

export const login = async (email: string, senha: string): Promise<LoginResult> => {
  const [adminRows] = await pool.query<RowDataPacket[]>('SELECT * FROM Admins WHERE email = ?', [email]);
  if (adminRows.length > 0) {
    const admin = adminRows[0];
    const isPasswordValid = await bcrypt.compare(senha, admin.senha);
    if (isPasswordValid) {
      const token = jwt.sign({ id: admin.id, nome: admin.nome, isAdmin: true }, JWT_SECRET, { expiresIn: '1h' });
      const adminUser: UserPublic = {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        ra: '',
        instituicao_id: null,
        curso_id: null,
        periodo: null,
        semestre: null,
        previsao_termino: null,
        is_active: true,
        isAdmin: true,
        desbloqueio_aprovado_em: null,
        instituicao_nome: 'Admin',
        curso_nome: 'N/A'
      };
      return { token, user: adminUser };
    } else {
      throw new Error('E-mail ou senha inválidos.');
    }
  }

  const [userRows] = await pool.query<UsuarioRow[]>(
    `
    SELECT u.*, i.nome as instituicao_nome, c.nome as curso_nome
    FROM Usuarios u
    LEFT JOIN Instituicoes i ON u.instituicao_id = i.id
    LEFT JOIN Cursos c ON u.curso_id = c.id
    WHERE u.email = ?
  `,
    [email]
  );
  if (userRows.length > 0) {
    const user = userRows[0];
    // MODIFICADO: Checa se a conta está trancada e lança um erro específico
    if (user.is_trancado) {
      const error = new Error('ACCOUNT_LOCKED');
      (error as any).statusCode = 403;
      throw error;
    }
    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (isPasswordValid) {
      const token = jwt.sign({ id: user.id, nome: user.nome, isAdmin: false, is_active: user.is_active }, JWT_SECRET, { expiresIn: '1h' });
      const userPublic: UserPublic = {
        id: user.id,
        nome: user.nome,
        email: user.email,
        ra: user.ra,
        instituicao_id: user.instituicao_id,
        curso_id: user.curso_id,
        periodo: user.periodo,
        semestre: user.semestre,
        previsao_termino: user.previsao_termino,
        is_active: user.is_active,
        isAdmin: false,
        desbloqueio_aprovado_em: user.desbloqueio_aprovado_em,
        instituicao_nome: user.instituicao_nome,
        curso_nome: user.curso_nome
      };
      return { token, user: userPublic };
    } else {
      throw new Error('E-mail ou senha inválidos.');
    }
  }

  throw new Error('E-mail ou senha inválidos.');
};

export const validateUnlockCode = async (cpf: string, code: string) => {
  // 1. Encontrar usuário pelo CPF
  const [userRows] = await pool.query<UsuarioRow[]>('SELECT * FROM Usuarios WHERE cpf = ?', [cpf]);
  if (userRows.length === 0) {
    throw new Error('CPF não encontrado.');
  }
  const user = userRows[0];

  // 2. Encontrar a solicitação de desbloqueio aprovada mais recente
  const [desbloqueioRows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM Desbloqueios WHERE usuario_id = ? AND status = \'APPROVED\' ORDER BY criado_em DESC LIMIT 1',
    [user.id]
  );
  if (desbloqueioRows.length === 0) {
    throw new Error('Nenhuma solicitação de desbloqueio aprovada encontrada para este usuário.');
  }
  const desbloqueio = desbloqueioRows[0];

  // 3. Validar o código
  if (!desbloqueio.verification_code || desbloqueio.verification_code !== code) {
    throw new Error('Código de verificação inválido.');
  }

  // 4. Checar a data de expiração
  if (new Date(desbloqueio.code_expires_at) < new Date()) {
    throw new Error('Código de verificação expirado.');
  }

  // 5. Se tudo estiver OK, reativar o usuário e invalidar o código
  await pool.query(
    'UPDATE Usuarios SET is_trancado = FALSE, desbloqueio_aprovado_em = NOW() WHERE id = ?',
    [user.id]
  );
  await pool.query(
    'UPDATE Desbloqueios SET verification_code = NULL, code_expires_at = NULL WHERE id = ?',
    [desbloqueio.id]
  );

  // 6. Retornar sucesso (ou dados do usuário, se necessário)
  return { message: 'Conta reativada com sucesso! Você será redirecionado para o login.' };
};


export const forgotPassword = async (email: string) => {
  const [users] = await pool.query<RowDataPacket[]>('SELECT id FROM Usuarios WHERE email = ?', [email]);
  if (users.length === 0) {
    console.warn(`Tentativa de recuperação de senha para e-mail não cadastrado: ${email}`);
    return null; // Não lançar erro para evitar enumeração de usuários
  }
  const user = users[0];
  const resetCode = generateRandomCode();
  const resetTokenExpiresAt = new Date(Date.now() + 300000); // 5 minutos de validade
  await pool.query('UPDATE Usuarios SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?', [resetCode, resetTokenExpiresAt, user.id]);
  
  // Enviar e-mail com o código
  await sendEmail(email, 'Código de Recuperação de Senha', `Seu código de recuperação de senha é: ${resetCode}. Ele é válido por 5 minutos.`);
  
  return resetCode;
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