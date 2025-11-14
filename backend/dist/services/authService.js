"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.validateResetCode = exports.forgotPassword = exports.validateUnlockCode = exports.login = exports.register = void 0;
const database_1 = __importDefault(require("../config/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const autoEntityService_1 = require("./autoEntityService");
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
const sendEmail = (to, subject, text) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('--- SIMULANDO ENVIO DE E-MAIL ---');
    console.log(`Para: ${to}`);
    console.log(`Assunto: ${subject}`);
    console.log('Corpo: ' + text);
    console.log('----------------------------------');
});
const register = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('--- INICIANDO PROCESSO DE REGISTRO ---');
    const { nome, cpf, ra, email, senha, instituicao_id, curso_id, institutionText, courseText, periodo, semestre, previsaoTermino, } = userData;
    // Verificações básicas
    if (!nome || !email || !senha || !ra) {
        throw new Error('Campos obrigatórios ausentes.');
    }
    // Checar CPF e e-mail únicos
    const [cpfRows] = yield database_1.default.query('SELECT id FROM Usuarios WHERE cpf = ?', [cpf]);
    if (cpf && cpfRows.length > 0) {
        throw new Error('CPF já cadastrado.');
    }
    const [emailRows] = yield database_1.default.query('SELECT id FROM Usuarios WHERE email = ?', [email]);
    if (emailRows.length > 0) {
        throw new Error('E-mail já cadastrado.');
    }
    // Hash da senha
    const hashedPassword = yield bcrypt_1.default.hash(senha, 10);
    // Resolver instituição e curso: se institutionText/courseText fornecidos, tentar encontrar por nome ou criar
    let finalInstituicaoId = instituicao_id;
    let finalCursoId = curso_id;
    // Normalização simples: trim, collapse múltiplos espaços
    const normalize = (s) => {
        if (!s && s !== '')
            return s;
        return String(s).trim().replace(/\s+/g, ' ');
    };
    const institutionTextNorm = normalize(institutionText);
    const courseTextNorm = normalize(courseText);
    // Logic for Institution
    if (!finalInstituicaoId && institutionTextNorm) {
        let institutionId = null;
        // 1. Try to find the institution
        const [instRows] = yield database_1.default.query("SELECT id FROM Instituicoes WHERE LOWER(nome) = ?", [institutionTextNorm.toLowerCase()]);
        if (instRows.length > 0) {
            institutionId = instRows[0].id;
        }
        else {
            // 2. If not found, create it
            try {
                const [insertInst] = yield database_1.default.query('INSERT INTO Instituicoes (nome, is_active) VALUES (?, TRUE)', [institutionTextNorm]);
                if (insertInst.insertId) {
                    institutionId = insertInst.insertId;
                    // Optional: log the auto-creation
                    yield (0, autoEntityService_1.logAutoCreatedEntity)('instituicao', institutionTextNorm, email, { createdId: institutionId }).catch(e => console.error("Logging failed", e));
                }
            }
            catch (error) {
                // This can happen in a race condition where another request created the institution between our SELECT and INSERT.
                // In that case, we just re-fetch it.
                if (error.code === 'ER_DUP_ENTRY') {
                    const [refetchRows] = yield database_1.default.query("SELECT id FROM Instituicoes WHERE LOWER(nome) = ?", [institutionTextNorm.toLowerCase()]);
                    if (refetchRows.length > 0) {
                        institutionId = refetchRows[0].id;
                    }
                }
                else {
                    // For other errors, we might want to throw
                    throw error;
                }
            }
        }
        finalInstituicaoId = institutionId;
    }
    // Logic for Course
    if (!finalCursoId && courseTextNorm && finalInstituicaoId) {
        let courseId = null;
        // 1. Try to find the course
        const [cursoRows] = yield database_1.default.query("SELECT id FROM Cursos WHERE LOWER(nome) = ? AND instituicao_id = ?", [courseTextNorm.toLowerCase(), finalInstituicaoId]);
        if (cursoRows.length > 0) {
            courseId = cursoRows[0].id;
        }
        else {
            // 2. If not found, create it
            try {
                const [insertCourse] = yield database_1.default.query('INSERT INTO Cursos (nome, instituicao_id, is_active) VALUES (?, ?, TRUE)', [courseTextNorm, finalInstituicaoId]);
                if (insertCourse.insertId) {
                    courseId = insertCourse.insertId;
                    // Optional: log the auto-creation
                    yield (0, autoEntityService_1.logAutoCreatedEntity)('curso', courseTextNorm, email, { createdId: courseId, instituicaoId: finalInstituicaoId }).catch(e => console.error("Logging failed", e));
                }
            }
            catch (error) {
                // This can happen in a race condition where another request created the course between our SELECT and INSERT.
                // In that case, we just re-fetch it.
                if (error.code === 'ER_DUP_ENTRY') {
                    const [refetchRows] = yield database_1.default.query("SELECT id FROM Cursos WHERE LOWER(nome) = ? AND instituicao_id = ?", [courseTextNorm.toLowerCase(), finalInstituicaoId]);
                    if (refetchRows.length > 0) {
                        courseId = refetchRows[0].id;
                    }
                }
                else {
                    // For other errors, we might want to throw
                    throw error;
                }
            }
        }
        finalCursoId = courseId;
    }
    // Gerar anonymized_id
    const anonymizedId = crypto_1.default.randomBytes(16).toString('hex');
    // Inserir usuário
    const [insertResult] = yield database_1.default.query(`INSERT INTO Usuarios (nome, cpf, ra, email, senha, instituicao_id, curso_id, periodo, semestre, previsao_termino, anonymized_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [nome, cpf || null, ra, email, hashedPassword, finalInstituicaoId || null, finalCursoId || null, periodo || null, semestre || null, previsaoTermino || null, anonymizedId]);
    const newUserId = insertResult.insertId;
    const [newUsers] = yield database_1.default.query('SELECT id, nome, cpf, ra, email, instituicao_id, curso_id, periodo, semestre, previsao_termino, anonymized_id, is_active, criado_em FROM Usuarios WHERE id = ?', [newUserId]);
    const createdUser = newUsers[0];
    return createdUser;
});
exports.register = register;
const login = (email, senha) => __awaiter(void 0, void 0, void 0, function* () {
    const [adminRows] = yield database_1.default.query('SELECT * FROM Admins WHERE email = ?', [email]);
    if (adminRows.length > 0) {
        const admin = adminRows[0];
        const isPasswordValid = yield bcrypt_1.default.compare(senha, admin.senha);
        if (isPasswordValid) {
            const token = jsonwebtoken_1.default.sign({ id: admin.id, nome: admin.nome, isAdmin: true }, JWT_SECRET, { expiresIn: '1h' });
            const adminUser = {
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
        }
        else {
            throw new Error('E-mail ou senha inválidos.');
        }
    }
    const [userRows] = yield database_1.default.query(`
    SELECT u.*, i.nome as instituicao_nome, c.nome as curso_nome
    FROM Usuarios u
    LEFT JOIN Instituicoes i ON u.instituicao_id = i.id
    LEFT JOIN Cursos c ON u.curso_id = c.id
    WHERE u.email = ?
  `, [email]);
    if (userRows.length > 0) {
        const user = userRows[0];
        // MODIFICADO: Checa se a conta está trancada e lança um erro específico
        if (user.is_trancado) {
            const error = new Error('ACCOUNT_LOCKED');
            error.statusCode = 403;
            throw error;
        }
        const isPasswordValid = yield bcrypt_1.default.compare(senha, user.senha);
        if (isPasswordValid) {
            const token = jsonwebtoken_1.default.sign({ id: user.id, nome: user.nome, isAdmin: false, is_active: user.is_active }, JWT_SECRET, { expiresIn: '1h' });
            const userPublic = {
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
        }
        else {
            throw new Error('E-mail ou senha inválidos.');
        }
    }
    throw new Error('E-mail ou senha inválidos.');
});
exports.login = login;
const validateUnlockCode = (cpf, code) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Encontrar usuário pelo CPF
    const [userRows] = yield database_1.default.query('SELECT * FROM Usuarios WHERE cpf = ?', [cpf]);
    if (userRows.length === 0) {
        throw new Error('CPF não encontrado.');
    }
    const user = userRows[0];
    // 2. Encontrar a solicitação de desbloqueio aprovada mais recente
    const [desbloqueioRows] = yield database_1.default.query('SELECT * FROM Desbloqueios WHERE usuario_id = ? AND status = \'APPROVED\' ORDER BY criado_em DESC LIMIT 1', [user.id]);
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
    yield database_1.default.query('UPDATE Usuarios SET is_trancado = FALSE, desbloqueio_aprovado_em = NOW() WHERE id = ?', [user.id]);
    yield database_1.default.query('UPDATE Desbloqueios SET verification_code = NULL, code_expires_at = NULL WHERE id = ?', [desbloqueio.id]);
    // 6. Retornar sucesso (ou dados do usuário, se necessário)
    return { message: 'Conta reativada com sucesso! Você será redirecionado para o login.' };
});
exports.validateUnlockCode = validateUnlockCode;
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const [users] = yield database_1.default.query('SELECT id FROM Usuarios WHERE email = ?', [email]);
    if (users.length === 0) {
        console.warn(`Tentativa de recuperação de senha para e-mail não cadastrado: ${email}`);
        return null; // Não lançar erro para evitar enumeração de usuários
    }
    const user = users[0];
    const resetCode = generateRandomCode();
    const resetTokenExpiresAt = new Date(Date.now() + 300000); // 5 minutos de validade
    yield database_1.default.query('UPDATE Usuarios SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?', [resetCode, resetTokenExpiresAt, user.id]);
    // Enviar e-mail com o código
    yield sendEmail(email, 'Código de Recuperação de Senha', `Seu código de recuperação de senha é: ${resetCode}. Ele é válido por 5 minutos.`);
    return resetCode;
});
exports.forgotPassword = forgotPassword;
const validateResetCode = (email, code) => __awaiter(void 0, void 0, void 0, function* () {
    const [users] = yield database_1.default.query('SELECT id, reset_token, reset_token_expires_at FROM Usuarios WHERE email = ?', [email]);
    if (users.length === 0) {
        throw new Error('E-mail não encontrado.');
    }
    const user = users[0];
    if (user.reset_token === code && user.reset_token_expires_at > new Date()) {
        return true; // Código válido
    }
    throw new Error('Código inválido ou expirado.');
});
exports.validateResetCode = validateResetCode;
const resetPassword = (email, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const [users] = yield database_1.default.query('SELECT id, reset_token_expires_at FROM Usuarios WHERE email = ?', [email]);
    if (users.length === 0) {
        throw new Error('E-mail não encontrado.');
    }
    const user = users[0];
    // Verifica se o token ainda é válido (já foi validado antes, mas é uma segurança extra)
    if (!user.reset_token || user.reset_token_expires_at < new Date()) {
        throw new Error('Token de redefinição de senha inválido ou expirado.');
    }
    // Password strength validation
    if (newPassword.length < 8) {
        throw new Error('A senha deve ter pelo menos 8 caracteres.');
    }
    if (!/[0-9]/.test(newPassword)) {
        throw new Error('A senha deve conter pelo menos 1 número.');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        throw new Error('A senha deve conter pelo menos 1 caractere especial.');
    }
    if (!/[A-Z]/.test(newPassword)) {
        throw new Error('A senha deve conter pelo menos 1 letra maiúscula.');
    }
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
    yield database_1.default.query('UPDATE Usuarios SET senha = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?', [hashedPassword, user.id]);
    return true;
});
exports.resetPassword = resetPassword;
