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
exports.requestDesbloqueio = exports.trancarCurso = exports.adminChangePassword = exports.changePassword = exports.updateUserDetails = exports.updateUserProfile = exports.getUserById = exports.getAdminById = void 0;
const database_1 = __importDefault(require("../config/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// ------------------
const getAdminById = (adminId) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield database_1.default.query('SELECT id, nome, email FROM Admins WHERE id = ?', [adminId]);
    if (rows.length === 0) {
        throw new Error('Administrador não encontrado.');
    }
    return Object.assign(Object.assign({}, rows[0]), { isAdmin: true });
});
exports.getAdminById = getAdminById;
const getUserById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield database_1.default.query('SELECT id, nome, email, cpf, ra, instituicao_id, curso_id, periodo, semestre, previsao_termino, anonymized_id, is_active, is_trancado, desbloqueio_aprovado_em FROM Usuarios WHERE id = ?', [userId]);
    if (rows.length === 0) {
        throw new Error('Usuário não encontrado.');
    }
    return rows[0];
});
exports.getUserById = getUserById;
const updateUserProfile = (userId, data, options) => __awaiter(void 0, void 0, void 0, function* () {
    const allowAdminOverride = (options === null || options === void 0 ? void 0 : options.allowAdminOverride) === true;
    // Fetch the user to check their unlock status
    const user = yield (0, exports.getUserById)(userId);
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
    const fields = [];
    const values = [];
    // If the update is happening within the unlock window, clear the approval date
    if (isWithinUnlockWindow) {
        fields.push('desbloqueio_aprovado_em = NULL');
    }
    // Allow updating name and email as well
    if (data.nome) {
        fields.push('nome = ?');
        values.push(data.nome);
    }
    if (data.email) {
        // check uniqueness
        const [existingEmail] = yield database_1.default.query('SELECT id FROM Usuarios WHERE email = ? AND id <> ?', [data.email, userId]);
        if (existingEmail.length > 0)
            throw new Error('E-mail já cadastrado por outro usuário.');
        fields.push('email = ?');
        values.push(data.email);
    }
    if (data.instituicao_id) {
        fields.push('instituicao_id = ?');
        values.push(data.instituicao_id);
    }
    if (data.curso_id) {
        fields.push('curso_id = ?');
        values.push(data.curso_id);
    }
    if (data.periodo) {
        fields.push('periodo = ?');
        values.push(data.periodo);
    }
    if (data.previsaoTermino) {
        fields.push('previsao_termino = ?');
        values.push(data.previsaoTermino);
    }
    if (data.ra) {
        fields.push('ra = ?');
        values.push(data.ra);
    }
    if (data.is_active !== undefined) {
        fields.push('is_active = ?');
        values.push(data.is_active);
    }
    if (fields.length === 0) {
        return (0, exports.getUserById)(userId);
    }
    values.push(userId);
    const query = `UPDATE Usuarios SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = yield database_1.default.query(query, values);
    if (result.affectedRows === 0) {
        throw new Error('Usuário não encontrado ao tentar atualizar.');
    }
    return (0, exports.getUserById)(userId);
});
exports.updateUserProfile = updateUserProfile;
const updateUserDetails = (userId, details) => __awaiter(void 0, void 0, void 0, function* () {
    const fields = [];
    const values = [];
    if (details.instituicao_id !== undefined) {
        fields.push('instituicao_id = ?');
        values.push(details.instituicao_id);
    }
    if (details.curso_id !== undefined) {
        fields.push('curso_id = ?');
        values.push(details.curso_id);
    }
    if (details.is_active !== undefined) {
        fields.push('is_active = ?');
        values.push(details.is_active);
    }
    if (fields.length === 0)
        throw new Error('Nenhum dado para atualizar.');
    values.push(userId);
    const query = `UPDATE Usuarios SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = yield database_1.default.query(query, values);
    if (result.affectedRows === 0)
        throw new Error('Usuário não encontrado ao tentar atualizar.');
    return (0, exports.getUserById)(userId);
});
exports.updateUserDetails = updateUserDetails;
const changePassword = (userId, oldPassword, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield database_1.default.query('SELECT senha FROM Usuarios WHERE id = ?', [userId]);
    if (rows.length === 0)
        throw new Error('Usuário não encontrado.');
    const user = rows[0];
    const isValid = yield bcrypt_1.default.compare(oldPassword, user.senha);
    if (!isValid)
        throw new Error('Senha antiga incorreta.');
    if (newPassword.length < 8)
        throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
    const hashed = yield bcrypt_1.default.hash(newPassword, 10);
    yield database_1.default.query('UPDATE Usuarios SET senha = ? WHERE id = ?', [hashed, userId]);
    return true;
});
exports.changePassword = changePassword;
const adminChangePassword = (userId, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    if (newPassword.length < 8)
        throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
    const hashed = yield bcrypt_1.default.hash(newPassword, 10);
    yield database_1.default.query('UPDATE Usuarios SET senha = ? WHERE id = ?', [hashed, userId]);
    return true;
});
exports.adminChangePassword = adminChangePassword;
const trancarCurso = (userId, motivo) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield database_1.default.query('UPDATE Usuarios SET is_trancado = TRUE, motivo_trancamento = ? WHERE id = ?', [motivo, userId]);
    if (result.affectedRows === 0)
        throw new Error('Usuário não encontrado.');
    return (0, exports.getUserById)(userId);
});
exports.trancarCurso = trancarCurso;
const requestDesbloqueio = (userId, motivo) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield database_1.default.query('INSERT INTO Desbloqueios (usuario_id, motivo) VALUES (?, ?)', [userId, motivo || null]);
    return { id: result.insertId, usuario_id: userId, status: 'PENDING' };
});
exports.requestDesbloqueio = requestDesbloqueio;
