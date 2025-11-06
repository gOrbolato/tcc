"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.rejectDesbloqueio = exports.deleteUser = exports.approveDesbloqueio = exports.listDesbloqueios = exports.getAllUsers = void 0;
const adminUserService = __importStar(require("../services/adminUserService"));
const database_1 = __importDefault(require("../config/database"));
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filters = {
            ra: req.query.ra,
            q: req.query.q,
            institutionId: req.query.institutionId,
            courseId: req.query.courseId,
            anonymizedId: req.query.anonymizedId,
        };
        const users = yield adminUserService.getFilteredUsers(filters);
        res.status(200).json(users);
    }
    catch (error) {
        console.error("--- ERRO DETALHADO AO BUSCAR USUÁRIOS ---", error);
        res.status(500).json({ message: 'Erro ao buscar usuários.', error: error.message });
    }
});
exports.getAllUsers = getAllUsers;
const listDesbloqueios = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Return anonymized_id instead of exposing nome/email
        const [rows] = yield database_1.default.query('SELECT d.id, d.usuario_id, d.status, d.motivo, d.criado_em, u.anonymized_id FROM Desbloqueios d JOIN Usuarios u ON d.usuario_id = u.id WHERE d.status = ? ORDER BY d.criado_em ASC', ['PENDING']);
        res.status(200).json(rows);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.listDesbloqueios = listDesbloqueios;
const approveDesbloqueio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = Number(req.params.id);
        const adminId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null;
        // set desbloqueio status approved and unlock user
        yield database_1.default.query('UPDATE Desbloqueios SET status = ?, admin_id = ?, atualizado_em = NOW() WHERE id = ?', ['APPROVED', adminId, id]);
        // get record to know usuario_id
        const [rows] = yield database_1.default.query('SELECT usuario_id FROM Desbloqueios WHERE id = ?', [id]);
        if (rows.length === 0)
            return res.status(404).json({ message: 'Pedido não encontrado.' });
        const usuarioId = rows[0].usuario_id;
        yield database_1.default.query('UPDATE Usuarios SET is_active = TRUE WHERE id = ?', [usuarioId]);
        res.status(200).json({ message: 'Desbloqueio aprovado e usuário desbloqueado.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.approveDesbloqueio = approveDesbloqueio;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = Number(req.params.id);
        yield adminUserService.deleteUser(userId);
        res.status(200).json({ message: 'Usuário removido com sucesso!' });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.deleteUser = deleteUser;
const rejectDesbloqueio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = Number(req.params.id);
        const adminId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null;
        yield database_1.default.query('UPDATE Desbloqueios SET status = ?, admin_id = ?, atualizado_em = NOW() WHERE id = ?', ['REJECTED', adminId, id]);
        res.status(200).json({ message: 'Pedido rejeitado.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.rejectDesbloqueio = rejectDesbloqueio;
