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
exports.getEvaluationsByUserId = exports.getFilteredEvaluations = void 0;
const database_1 = __importDefault(require("../config/database"));
// Para o painel de admin
const getFilteredEvaluations = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    let query = `
    SELECT 
      a.id, a.media_final, a.criado_em, 
      i.nome AS instituicao_nome, 
      c.nome AS curso_nome,
      u.ra AS usuario_ra,
      u.anonymized_id
      ${filters.latitude && filters.longitude ? ", ( 6371 * acos( cos( radians(?) ) * cos( radians( i.latitude ) ) * cos( radians( i.longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( i.latitude ) ) ) ) AS distance" : ""}
    FROM Avaliacoes a
    JOIN Instituicoes i ON a.instituicao_id = i.id
    JOIN Cursos c ON a.curso_id = c.id
    JOIN Usuarios u ON a.usuario_id = u.id
    WHERE 1=1
  `;
    const params = [];
    if (filters.latitude && filters.longitude) {
        params.push(Number(filters.latitude), Number(filters.longitude), Number(filters.latitude));
    }
    if (filters.institutionId) {
        query += ' AND a.instituicao_id = ?';
        params.push(filters.institutionId);
    }
    if (filters.courseId) {
        query += ' AND a.curso_id = ?';
        params.push(filters.courseId);
    }
    if (filters.anonymizedId) {
        query += ' AND u.anonymized_id = ?';
        params.push(filters.anonymizedId);
    }
    if (filters.latitude && filters.longitude && filters.radius) {
        query += ' HAVING distance < ?';
        params.push(Number(filters.radius));
    }
    query += ' ORDER BY a.criado_em DESC';
    const [evaluations] = yield database_1.default.query(query, params);
    return evaluations;
});
exports.getFilteredEvaluations = getFilteredEvaluations;
// Para o dashboard do usuário
const getEvaluationsByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT 
      a.id, a.media_final, a.criado_em, 
      i.nome AS instituicao_nome, 
      c.nome AS curso_nome
    FROM Avaliacoes a 
    LEFT JOIN Instituicoes i ON a.instituicao_id = i.id 
    LEFT JOIN Cursos c ON a.curso_id = c.id 
    WHERE a.usuario_id = ? 
    ORDER BY a.criado_em DESC`;
    const [evaluations] = yield database_1.default.query(query, [userId]);
    return evaluations;
});
exports.getEvaluationsByUserId = getEvaluationsByUserId;
