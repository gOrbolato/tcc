// Importa a pool de conexões do banco de dados.
import pool from '../config/database';
// Importa a biblioteca bcrypt para hash de senhas.
import bcrypt from 'bcrypt';
// Importa a biblioteca jsonwebtoken para criar tokens de autenticação.
import jwt from 'jsonwebtoken';
// Importa os tipos OkPacket e RowDataPacket do mysql2 para tipar os resultados das queries.
import { OkPacket, RowDataPacket } from 'mysql2';
// Importa a tipagem de usuário.
import { UsuarioRow } from '../types/user';
// Importa o módulo crypto para gerar dados aleatórios.
import crypto from 'crypto';
// Importa o serviço de log de entidades autocriadas.
import { logAutoCreatedEntity } from './autoEntityService';

// Segredo para a assinatura do JWT.
const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_jwt_aqui';

// Função para gerar um código aleatório (3 letras e 4 números).
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

// Simulação de envio de e-mail.
const sendEmail = async (to: string, subject: string, text: string) => {
  console.log('--- SIMULANDO ENVIO DE E-MAIL ---');
  console.log(`Para: ${to}`);
  console.log(`Assunto: ${subject}`);
  console.log('Corpo: ' + text);
  console.log('----------------------------------');
};

/**
 * @function register
 * @description Registra um novo usuário, criando instituição e curso se necessário.
 * @param {any} userData - Os dados do usuário para registro.
 * @returns {Promise<RowDataPacket>} - O usuário recém-criado.
 */
export const register = async (userData: any): Promise<RowDataPacket> => {
  const {
    nome, cpf, ra, email, senha, institutionId, courseId, institutionText,
    courseText, periodo, semestre, previsaoTermino, institutionCity, institutionState,
  } = userData;

  if (!nome || !email || !senha || !ra) throw new Error('Campos obrigatórios ausentes.');

  const [cpfRows] = await pool.query<RowDataPacket[]>('SELECT id FROM Usuarios WHERE cpf = ?', [cpf]);
  if (cpf && cpfRows.length > 0) throw new Error('CPF já cadastrado.');

  const [emailRows] = await pool.query<RowDataPacket[]>('SELECT id FROM Usuarios WHERE email = ?', [email]);
  if (emailRows.length > 0) throw new Error('E-mail já cadastrado.');

  const hashedPassword = await bcrypt.hash(senha, 10);

  let finalInstituicaoId = institutionId;
  let finalCursoId = courseId;
  const normalize = (s: any) => s ? String(s).trim().replace(/\s+/g, ' ') : s;

  const institutionTextNorm = normalize(institutionText);
  const courseTextNorm = normalize(courseText);

  if (!finalInstituicaoId && institutionTextNorm) {
    const [instRows] = await pool.query<RowDataPacket[]>("SELECT id FROM Instituicoes WHERE LOWER(nome) = ?", [institutionTextNorm.toLowerCase()]);
    if (instRows.length > 0) {
      finalInstituicaoId = instRows[0].id;
    } else {
      try {
        const [insertInst] = await pool.query<OkPacket>(
          'INSERT INTO Instituicoes (nome, cidade, estado, is_active) VALUES (?, ?, ?, TRUE)',
          [institutionTextNorm, normalize(institutionCity), normalize(institutionState)]
        );
        finalInstituicaoId = insertInst.insertId;
        await logAutoCreatedEntity('instituicao', institutionTextNorm, email, { createdId: finalInstituicaoId, cidade: normalize(institutionCity), estado: normalize(institutionState) });
      } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
          const [refetchRows] = await pool.query<RowDataPacket[]>("SELECT id FROM Instituicoes WHERE LOWER(nome) = ?", [institutionTextNorm.toLowerCase()]);
          if (refetchRows.length > 0) finalInstituicaoId = refetchRows[0].id;
        } else {
          throw error;
        }
      }
    }
  }

  if (!finalCursoId && courseTextNorm && finalInstituicaoId) {
    const [cursoRows] = await pool.query<RowDataPacket[]>("SELECT id FROM Cursos WHERE LOWER(nome) = ? AND instituicao_id = ?", [courseTextNorm.toLowerCase(), finalInstituicaoId]);
    if (cursoRows.length > 0) {
      finalCursoId = cursoRows[0].id;
    } else {
      try {
        const [insertCourse] = await pool.query<OkPacket>('INSERT INTO Cursos (nome, instituicao_id, is_active) VALUES (?, ?, TRUE)', [courseTextNorm, finalInstituicaoId]);
        finalCursoId = insertCourse.insertId;
        await logAutoCreatedEntity('curso', courseTextNorm, email, { createdId: finalCursoId, instituicaoId: finalInstituicaoId });
      } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
          const [refetchRows] = await pool.query<RowDataPacket[]>("SELECT id FROM Cursos WHERE LOWER(nome) = ? AND instituicao_id = ?", [courseTextNorm.toLowerCase(), finalInstituicaoId]);
          if (refetchRows.length > 0) finalCursoId = refetchRows[0].id;
        } else {
          throw error;
        }
      }
    }
  }

  const anonymizedId = crypto.randomBytes(16).toString('hex');

  const [insertResult] = await pool.query<OkPacket>(
    `INSERT INTO Usuarios (nome, cpf, ra, email, senha, instituicao_id, curso_id, periodo, semestre, previsao_termino, anonymized_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nome, cpf || null, ra, email, hashedPassword, finalInstituicaoId || null, finalCursoId || null, periodo || null, semestre || null, previsaoTermino || null, anonymizedId]
  );

  const [newUsers] = await pool.query<RowDataPacket[]>('SELECT id, nome, cpf, ra, email, instituicao_id, curso_id, periodo, semestre, previsao_termino, anonymized_id, is_active, criado_em FROM Usuarios WHERE id = ?', [insertResult.insertId]);
  return newUsers[0];
};

// Interface para os dados públicos do usuário.
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

// Interface para o resultado do login.
interface LoginResult {
  token: string;
  user: UserPublic;
}

/**
 * @function login
 * @description Autentica um usuário ou administrador e retorna um token JWT.
 * @param {string} email - O email do usuário/admin.
 * @param {string} senha - A senha do usuário/admin.
 * @returns {Promise<LoginResult>} - O token e os dados públicos do usuário/admin.
 */
export const login = async (email: string, senha: string): Promise<LoginResult> => {
  const [adminRows] = await pool.query<RowDataPacket[]>('SELECT * FROM Admins WHERE email = ?', [email]);
  if (adminRows.length > 0) {
    const admin = adminRows[0];
    const isPasswordValid = await bcrypt.compare(senha, admin.senha);
    if (isPasswordValid) {
      const token = jwt.sign({ id: admin.id, nome: admin.nome, isAdmin: true }, JWT_SECRET, { expiresIn: '1h' });
      const adminUser: UserPublic = {
        id: admin.id, nome: admin.nome, email: admin.email, ra: '', instituicao_id: null,
        curso_id: null, periodo: null, semestre: null, previsao_termino: null, is_active: true,
        isAdmin: true, desbloqueio_aprovado_em: null, instituicao_nome: 'Admin', curso_nome: 'N/A'
      };
      return { token, user: adminUser };
    } else {
      throw new Error('E-mail ou senha inválidos.');
    }
  }

  const [userRows] = await pool.query<UsuarioRow[]>(
    `SELECT u.*, i.nome as instituicao_nome, c.nome as curso_nome FROM Usuarios u
     LEFT JOIN Instituicoes i ON u.instituicao_id = i.id
     LEFT JOIN Cursos c ON u.curso_id = c.id
     WHERE u.email = ?`, [email]
  );
  if (userRows.length > 0) {
    const user = userRows[0];
    if (user.is_trancado) throw new Error('ACCOUNT_LOCKED');

    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (isPasswordValid) {
      const token = jwt.sign({ id: user.id, nome: user.nome, isAdmin: false, is_active: user.is_active }, JWT_SECRET, { expiresIn: '1h' });
      const userPublic: UserPublic = {
        id: user.id, nome: user.nome, email: user.email, ra: user.ra, instituicao_id: user.instituicao_id,
        curso_id: user.curso_id, periodo: user.periodo, semestre: user.semestre, previsao_termino: user.previsao_termino,
        is_active: user.is_active, isAdmin: false, desbloqueio_aprovado_em: user.desbloqueio_aprovado_em,
        instituicao_nome: user.instituicao_nome, curso_nome: user.curso_nome
      };
      return { token, user: userPublic };
    } else {
      throw new Error('E-mail ou senha inválidos.');
    }
  }

  throw new Error('E-mail ou senha inválidos.');
};

/**
 * @function validateUnlockCode
 * @description Valida um código de desbloqueio e reativa a conta do usuário.
 * @param {string} cpf - O CPF do usuário.
 * @param {string} code - O código de desbloqueio.
 * @returns {Promise<{ message: string }>} - Uma mensagem de sucesso.
 */
export const validateUnlockCode = async (cpf: string, code: string): Promise<{ message: string }> => {
  const [userRows] = await pool.query<UsuarioRow[]>('SELECT * FROM Usuarios WHERE cpf = ?', [cpf]);
  if (userRows.length === 0) throw new Error('CPF não encontrado.');
  const user = userRows[0];

  const [desbloqueioRows] = await pool.query<RowDataPacket[]>('SELECT * FROM Desbloqueios WHERE usuario_id = ? AND status = \'APPROVED\' ORDER BY criado_em DESC LIMIT 1', [user.id]);
  if (desbloqueioRows.length === 0) throw new Error('Nenhuma solicitação de desbloqueio aprovada encontrada para este usuário.');
  const desbloqueio = desbloqueioRows[0];

  const isCodeValid = await bcrypt.compare(code, desbloqueio.verification_code);
  if (!desbloqueio.verification_code || !isCodeValid) throw new Error('Código de verificação inválido.');
  if (new Date(desbloqueio.code_expires_at) < new Date()) throw new Error('Código de verificação expirado.');

  await pool.query('UPDATE Usuarios SET is_trancado = FALSE, desbloqueio_aprovado_em = NOW() WHERE id = ?', [user.id]);
  await pool.query('UPDATE Desbloqueios SET verification_code = NULL, code_expires_at = NULL WHERE id = ?', [desbloqueio.id]);

  return { message: 'Conta reativada com sucesso! Você será redirecionado para o login.' };
};

/**
 * @function forgotPassword
 * @description Inicia o processo de recuperação de senha, gerando um código e enviando por e-mail.
 * @param {string} email - O email do usuário.
 * @returns {Promise<string | null>} - O código de recuperação gerado.
 */
export const forgotPassword = async (email: string): Promise<string | null> => {
  const [users] = await pool.query<RowDataPacket[]>('SELECT id FROM Usuarios WHERE email = ?', [email]);
  if (users.length === 0) {
    console.warn(`Tentativa de recuperação de senha para e-mail não cadastrado: ${email}`);
    return null;
  }
  const user = users[0];
  const resetCode = generateRandomCode();
  const resetTokenExpiresAt = new Date(Date.now() + 300000); // 5 minutos de validade
  await pool.query('UPDATE Usuarios SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?', [resetCode, resetTokenExpiresAt, user.id]);

  await sendEmail(email, 'Código de Recuperação de Senha', `Seu código de recuperação de senha é: ${resetCode}. Ele é válido por 5 minutos.`);
  return resetCode;
};

/**
 * @function validateResetCode
 * @description Valida um código de redefinição de senha.
 * @param {string} email - O email do usuário.
 * @param {string} code - O código de redefinição.
 * @returns {Promise<boolean>} - True se o código for válido.
 */
export const validateResetCode = async (email: string, code: string): Promise<boolean> => {
  const [users] = await pool.query<RowDataPacket[]>('SELECT id, reset_token, reset_token_expires_at FROM Usuarios WHERE email = ?', [email]);
  if (users.length === 0) throw new Error('E-mail não encontrado.');
  const user = users[0];
  if (user.reset_token === code && user.reset_token_expires_at > new Date()) return true;
  throw new Error('Código inválido ou expirado.');
};

/**
 * @function resetPassword
 * @description Redefine a senha do usuário com uma nova senha.
 * @param {string} email - O email do usuário.
 * @param {string} newPassword - A nova senha.
 * @returns {Promise<boolean>} - True se a senha for redefinida com sucesso.
 */
export const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
  const [users] = await pool.query<RowDataPacket[]>('SELECT id, reset_token_expires_at FROM Usuarios WHERE email = ?', [email]);
  if (users.length === 0) throw new Error('E-mail não encontrado.');

  if (newPassword.length < 8) throw new Error('A senha deve ter pelo menos 8 caracteres.');
  if (!/[0-9]/.test(newPassword)) throw new Error('A senha deve conter pelo menos 1 número.');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) throw new Error('A senha deve conter pelo menos 1 caractere especial.');
  if (!/[A-Z]/.test(newPassword)) throw new Error('A senha deve conter pelo menos 1 letra maiúscula.');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE Usuarios SET senha = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?', [hashedPassword, users[0].id]);
  return true;
};