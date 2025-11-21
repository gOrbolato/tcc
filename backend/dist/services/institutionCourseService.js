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
exports.getInstitutionsNearby = exports.mergeCourse = exports.mergeInstitution = exports.deleteCourse = exports.deleteInstitution = exports.updateCourse = exports.updateInstitution = exports.getCoursesByInstitution = exports.getAllInstitutions = void 0;
const database_1 = __importDefault(require("../config/database"));
const getAllInstitutions = (q) => __awaiter(void 0, void 0, void 0, function* () {
    // A base da query agora busca apenas de Instituicoes
    let query = `
    SELECT
      i.id,
      i.nome,
      i.latitude,
      i.longitude,
      i.cidade,
      i.estado,
      (SELECT AVG(a.media_final) FROM Avaliacoes a WHERE a.instituicao_id = i.id) AS media_avaliacoes
    FROM Instituicoes i
    WHERE i.is_active = TRUE
  `;
    const params = [];
    if (q) {
        const qNorm = `%${q.trim().replace(/\s+/g, ' ').toLowerCase()}%`;
        // A busca agora é feita com subquery para cursos, evitando o JOIN problemático
        query += `
      AND (
        LOWER(i.nome) LIKE ? OR
        LOWER(i.cidade) LIKE ? OR
        LOWER(i.estado) LIKE ? OR
        EXISTS (
          SELECT 1 FROM Cursos c WHERE c.instituicao_id = i.id AND LOWER(c.nome) LIKE ?
        )
      )
    `;
        params.push(qNorm, qNorm, qNorm, qNorm);
    }
    // O GROUP BY não é mais necessário, pois a agregação é feita na subquery
    query += ' ORDER BY ISNULL(media_avaliacoes), media_avaliacoes DESC, i.nome ASC';
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
    const connection = yield database_1.default.getConnection();
    try {
        // Check for related records
        const [users] = yield connection.query('SELECT id FROM Usuarios WHERE instituicao_id = ?', [institutionId]);
        const [courses] = yield connection.query('SELECT id FROM Cursos WHERE instituicao_id = ?', [institutionId]);
        const [evaluations] = yield connection.query('SELECT id FROM Avaliacoes WHERE instituicao_id = ?', [institutionId]);
        if (users.length > 0 || courses.length > 0 || evaluations.length > 0) {
            throw new Error('Não é possível excluir a instituição pois existem dados associados a ela. Por favor, migre os dados para outra instituição antes de excluir.');
        }
        yield connection.query('UPDATE Instituicoes SET is_active = FALSE WHERE id = ?', [institutionId]);
    }
    finally {
        connection.release();
    }
});
exports.deleteInstitution = deleteInstitution;
const deleteCourse = (courseId) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield database_1.default.getConnection();
    try {
        // Check for related records
        const [users] = yield connection.query('SELECT id FROM Usuarios WHERE curso_id = ?', [courseId]);
        const [evaluations] = yield connection.query('SELECT id FROM Avaliacoes WHERE curso_id = ?', [courseId]);
        if (users.length > 0 || evaluations.length > 0) {
            throw new Error('Não é possível excluir o curso pois existem dados associados a ele. Por favor, migre os dados para outro curso antes de excluir.');
        }
        yield connection.query('UPDATE Cursos SET is_active = FALSE WHERE id = ?', [courseId]);
    }
    finally {
        connection.release();
    }
});
exports.deleteCourse = deleteCourse;
const mergeInstitution = (sourceInstitutionId, destinationInstitutionId) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield database_1.default.getConnection();
    try {
        yield connection.beginTransaction();
        // Update related records
        yield connection.query('UPDATE Usuarios SET instituicao_id = ? WHERE instituicao_id = ?', [destinationInstitutionId, sourceInstitutionId]);
        yield connection.query('UPDATE Cursos SET instituicao_id = ? WHERE instituicao_id = ?', [destinationInstitutionId, sourceInstitutionId]);
        yield connection.query('UPDATE Avaliacoes SET instituicao_id = ? WHERE instituicao_id = ?', [destinationInstitutionId, sourceInstitutionId]);
        // Delete the source institution
        yield connection.query('DELETE FROM Instituicoes WHERE id = ?', [sourceInstitutionId]);
        yield connection.commit();
    }
    catch (error) {
        yield connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
});
exports.mergeInstitution = mergeInstitution;
const mergeCourse = (sourceCourseId, destinationCourseId) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield database_1.default.getConnection();
    try {
        yield connection.beginTransaction();
        // Update related records
        yield connection.query('UPDATE Usuarios SET curso_id = ? WHERE curso_id = ?', [destinationCourseId, sourceCourseId]);
        yield connection.query('UPDATE Avaliacoes SET curso_id = ? WHERE curso_id = ?', [destinationCourseId, sourceCourseId]);
        // Delete the source course
        yield connection.query('DELETE FROM Cursos WHERE id = ?', [sourceCourseId]);
        yield connection.commit();
    }
    catch (error) {
        yield connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
});
exports.mergeCourse = mergeCourse;
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
      AVG(a.media_final) AS average_media_final,
      (6371 * acos(cos(radians(?)) * cos(radians(i.latitude)) * cos(radians(i.longitude) - radians(?)) + sin(radians(?)) * sin(radians(i.latitude)))) AS distance
    FROM Instituicoes i
    LEFT JOIN Avaliacoes a ON i.id = a.instituicao_id
    WHERE i.is_active = TRUE AND i.latitude IS NOT NULL AND i.longitude IS NOT NULL
    GROUP BY i.id, i.nome, i.latitude, i.longitude
    HAVING distance <= ?
    ORDER BY average_media_final DESC, distance ASC
    LIMIT 10`, [latitude, longitude, latitude, radius]);
    return institutions;
});
exports.getInstitutionsNearby = getInstitutionsNearby;
