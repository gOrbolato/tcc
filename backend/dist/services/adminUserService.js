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
exports.deleteUser = exports.getFilteredUsers = void 0;
const database_1 = __importDefault(require("../config/database"));
const getFilteredUsers = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    // Select user fields plus institution/curso names and average rating
    let query = `
    SELECT 
      u.id, u.nome, u.email, u.ra, u.is_active, u.instituicao_id, u.curso_id, u.anonymized_id,
      i.nome AS instituicao_nome, c.nome AS curso_nome,
      AVG(a.media_final) AS media_avaliacoes
    FROM Usuarios u
    LEFT JOIN Instituicoes i ON u.instituicao_id = i.id
    LEFT JOIN Cursos c ON u.curso_id = c.id
    LEFT JOIN Avaliacoes a ON a.usuario_id = u.id
    WHERE 1=1
  `;
    const params = [];
    if (filters.ra) {
        query += ' AND u.ra LIKE ?';
        params.push(`%${filters.ra}%`);
    }
    if (filters.q) {
        query += ' AND (u.nome LIKE ? OR u.email LIKE ?)';
        params.push(`%${filters.q}%`, `%${filters.q}%`);
    }
    if (filters.institutionId) {
        query += ' AND u.instituicao_id = ?';
        params.push(Number(filters.institutionId));
    }
    if (filters.courseId) {
        query += ' AND u.curso_id = ?';
        params.push(Number(filters.courseId));
    }
    if (filters.anonymizedId) {
        query += ' AND u.anonymized_id = ?';
        params.push(filters.anonymizedId);
    }
    query += ' GROUP BY u.id';
    const [users] = yield database_1.default.query(query, params);
    return users;
});
exports.getFilteredUsers = getFilteredUsers;
const deleteUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield database_1.default.query('DELETE FROM Usuarios WHERE id = ?', [userId]);
    if (result.affectedRows === 0) {
        throw new Error('Usuário não encontrado.');
    }
});
exports.deleteUser = deleteUser;
