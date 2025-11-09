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
exports.getInstitutionsNearby = exports.deleteCourse = exports.deleteInstitution = exports.updateCourse = exports.updateInstitution = exports.getCoursesByInstitution = exports.getAllInstitutions = void 0;
const database_1 = __importDefault(require("../config/database"));
const getAllInstitutions = (q) => __awaiter(void 0, void 0, void 0, function* () {
    let query = 'SELECT id, nome, latitude, longitude FROM Instituicoes WHERE is_active = TRUE';
    const params = [];
    if (q) {
        const qNorm = q.trim().replace(/\s+/g, ' ').toLowerCase();
        query += ' AND LOWER(nome) LIKE ?';
        params.push(`%${qNorm}%`);
    }
    query += ' ORDER BY nome ASC';
    const [rows] = yield database_1.default.query(query, params);
    return rows;
});
exports.getAllInstitutions = getAllInstitutions;
const getCoursesByInstitution = (institutionId, q) => __awaiter(void 0, void 0, void 0, function* () {
    let query = 'SELECT id, nome FROM Cursos WHERE is_active = TRUE';
    const params = [];
    let whereClauses = [];
    if (institutionId) {
        whereClauses.push('instituicao_id = ?');
        params.push(institutionId);
    }
    if (q) {
        const qNorm = q.trim().replace(/\s+/g, ' ').toLowerCase();
        whereClauses.push('LOWER(nome) LIKE ?');
        params.push(`%${qNorm}%`);
    }
    if (whereClauses.length > 0) {
        query += ` AND ${whereClauses.join(' AND ')}`;
    }
    query += ' ORDER BY nome ASC';
    const [rows] = yield database_1.default.query(query, params);
    return rows;
});
exports.getCoursesByInstitution = getCoursesByInstitution;
const updateInstitution = (institutionId, nome) => __awaiter(void 0, void 0, void 0, function* () {
    const nomeNorm = String(nome).trim().replace(/\s+/g, ' ');
    yield database_1.default.query('UPDATE Instituicoes SET nome = ? WHERE id = ?', [nomeNorm, institutionId]);
    const [rows] = yield database_1.default.query('SELECT id, nome FROM Instituicoes WHERE id = ?', [institutionId]);
    return rows[0];
});
exports.updateInstitution = updateInstitution;
const updateCourse = (courseId, nome) => __awaiter(void 0, void 0, void 0, function* () {
    const nomeNorm = String(nome).trim().replace(/\s+/g, ' ');
    yield database_1.default.query('UPDATE Cursos SET nome = ? WHERE id = ?', [nomeNorm, courseId]);
    const [rows] = yield database_1.default.query('SELECT id, nome FROM Cursos WHERE id = ?', [courseId]);
    return rows[0];
});
exports.updateCourse = updateCourse;
const deleteInstitution = (institutionId) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.default.query('UPDATE Instituicoes SET is_active = FALSE WHERE id = ?', [institutionId]);
});
exports.deleteInstitution = deleteInstitution;
const deleteCourse = (courseId) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.default.query('UPDATE Cursos SET is_active = FALSE WHERE id = ?', [courseId]);
});
exports.deleteCourse = deleteCourse;
// Função para calcular a distância entre dois pontos usando a fórmula de Haversine
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra em quilômetros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
const getInstitutionsNearby = (latitude, longitude, radius) => __awaiter(void 0, void 0, void 0, function* () {
    const [institutions] = yield database_1.default.query(`SELECT 
      i.id, i.nome, i.latitude, i.longitude, 
      AVG(a.media_final) AS average_media_final
    FROM Instituicoes i
    LEFT JOIN Avaliacoes a ON i.id = a.instituicao_id
    WHERE i.is_active = TRUE AND i.latitude IS NOT NULL AND i.longitude IS NOT NULL
    GROUP BY i.id, i.nome, i.latitude, i.longitude
    HAVING average_media_final IS NOT NULL
    ORDER BY average_media_final DESC`);
    const nearbyInstitutions = institutions.filter(inst => {
        if (inst.latitude && inst.longitude) {
            const distance = haversineDistance(latitude, longitude, inst.latitude, inst.longitude);
            return distance <= radius;
        }
        return false;
    });
    // Ordenar novamente por média final decrescente (já está na query, mas para garantir após o filtro)
    nearbyInstitutions.sort((a, b) => (b.average_media_final || 0) - (a.average_media_final || 0));
    return nearbyInstitutions;
});
exports.getInstitutionsNearby = getInstitutionsNearby;
