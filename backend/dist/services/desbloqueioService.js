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
exports.getPendingDesbloqueioCount = exports.rejectDesbloqueio = exports.approveDesbloqueio = exports.getPendingDesbloqueios = void 0;
const database_1 = __importDefault(require("../config/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
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
    console.log('--- SIMULANDO ENVIO DE E-MAIL DE DESBLOQUEIO ---');
    console.log(`Para: ${to}`);
    console.log(`Assunto: ${subject}`);
    console.log('Corpo: ' + text);
    console.log('----------------------------------');
});
const getPendingDesbloqueios = (date) => __awaiter(void 0, void 0, void 0, function* () {
    let query = `
    SELECT d.id, d.motivo, d.criado_em, u.nome, u.email, u.anonymized_id
    FROM Desbloqueios d
    JOIN Usuarios u ON d.usuario_id = u.id
    WHERE d.status = 'PENDING'
  `;
    const params = [];
    if (date) {
        query += ' AND DATE(d.criado_em) = ?';
        params.push(date);
    }
    query += ' ORDER BY d.criado_em ASC';
    const [rows] = yield database_1.default.query(query, params);
    return rows;
});
exports.getPendingDesbloqueios = getPendingDesbloqueios;
const approveDesbloqueio = (desbloqueioId) => __awaiter(void 0, void 0, void 0, function* () {
    const [desbloqueioRows] = yield database_1.default.query('SELECT d.*, u.email FROM Desbloqueios d JOIN Usuarios u ON d.usuario_id = u.id WHERE d.id = ?', [desbloqueioId]);
    if (desbloqueioRows.length === 0) {
        throw new Error('Solicitação de desbloqueio não encontrada.');
    }
    const desbloqueio = desbloqueioRows[0];
    const userEmail = desbloqueio.email;
    if (desbloqueio.status !== 'PENDING') {
        throw new Error('Esta solicitação já foi processada.');
    }
    const verificationCode = generateRandomCode();
    const hashedCode = yield bcrypt_1.default.hash(verificationCode, 10);
    const codeExpiresAt = new Date(Date.now() + 3600000); // Expira em 1 hora
    yield database_1.default.query('UPDATE Desbloqueios SET status = \'APPROVED\', verification_code = ?, code_expires_at = ? WHERE id = ?', [hashedCode, codeExpiresAt, desbloqueioId]);
    // Enviar e-mail com o código para o usuário
    yield sendEmail(userEmail, 'Seu Pedido de Desbloqueio foi Aprovado', `Olá,\n\nSua solicitação de desbloqueio de conta foi aprovada.\nUse o seguinte código para reativar seu acesso: ${verificationCode}\nEste código expira em 1 hora.\n`);
    // Não alteramos mais a tabela Usuarios aqui. Isso será feito após a validação do código.
});
exports.approveDesbloqueio = approveDesbloqueio;
const rejectDesbloqueio = (desbloqueioId) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.default.query('UPDATE Desbloqueios SET status = \'REJECTED\' WHERE id = ?', [desbloqueioId]);
});
exports.rejectDesbloqueio = rejectDesbloqueio;
const getPendingDesbloqueioCount = () => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield database_1.default.query("SELECT COUNT(*) as count FROM Desbloqueios WHERE status = 'PENDING'");
    return rows[0].count;
});
exports.getPendingDesbloqueioCount = getPendingDesbloqueioCount;
