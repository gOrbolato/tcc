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
exports.mergeCourse = exports.mergeInstitution = exports.getInstitutionsNearby = exports.getCoursesByInstitution = exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.deleteInstitution = exports.updateInstitution = exports.createInstitution = exports.getCourses = exports.getInstitutions = void 0;
const institutionCourseService = __importStar(require("../services/institutionCourseService"));
const database_1 = __importDefault(require("../config/database"));
const getInstitutions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { q } = req.query;
        const institutions = yield institutionCourseService.getAllInstitutions(q);
        res.status(200).json(institutions);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao buscar instituições.', error: error.message });
    }
});
exports.getInstitutions = getInstitutions;
const getCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { institutionId, q } = req.query;
        const courses = yield institutionCourseService.getCoursesByInstitution(Number(institutionId) || undefined, q);
        res.status(200).json(courses);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao buscar cursos.', error: error.message });
    }
});
exports.getCourses = getCourses;
// Dummy implementations for the missing functions
const createInstitution = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nome, latitude, longitude, cidade, estado } = req.body;
        if (!nome)
            return res.status(400).json({ message: 'Nome da instituição é obrigatório.' });
        const nomeNorm = String(nome).trim().replace(/\s+/g, ' ');
        // Avoid duplicates (case-insensitive)
        const [exists] = yield database_1.default.query('SELECT id FROM Instituicoes WHERE LOWER(nome) = ?', [nomeNorm.toLowerCase()]);
        if (exists.length > 0)
            return res.status(409).json({ message: 'Instituição já existe.' });
        const [result] = yield database_1.default.query('INSERT INTO Instituicoes (nome, latitude, longitude, cidade, estado, is_active) VALUES (?, ?, ?, ?, ?, TRUE)', [nomeNorm, latitude || null, longitude || null, cidade || null, estado || null]);
        const insertId = result.insertId;
        const [rows] = yield database_1.default.query('SELECT id, nome, latitude, longitude, cidade, estado FROM Instituicoes WHERE id = ?', [insertId]);
        res.status(201).json(rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createInstitution = createInstitution;
const updateInstitution = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const institutionId = Number(req.params.id);
        const { nome } = req.body;
        const updatedInstitution = yield institutionCourseService.updateInstitution(institutionId, nome);
        res.status(200).json({ message: 'Instituição atualizada com sucesso!', institution: updatedInstitution });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateInstitution = updateInstitution;
const deleteInstitution = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const institutionId = Number(req.params.id);
        yield institutionCourseService.deleteInstitution(institutionId);
        res.status(200).json({ message: 'Instituição desativada com sucesso!' });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.deleteInstitution = deleteInstitution;
const createCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nome, instituicao_id } = req.body;
        if (!nome || !instituicao_id)
            return res.status(400).json({ message: 'Nome do curso e instituicao_id são obrigatórios.' });
        const nomeNorm = String(nome).trim().replace(/\s+/g, ' ');
        const [exists] = yield database_1.default.query('SELECT id FROM Cursos WHERE LOWER(nome) = ? AND instituicao_id = ?', [nomeNorm.toLowerCase(), instituicao_id]);
        if (exists.length > 0)
            return res.status(409).json({ message: 'Curso já existe para essa instituição.' });
        const [result] = yield database_1.default.query('INSERT INTO Cursos (nome, instituicao_id, is_active) VALUES (?, ?, TRUE)', [nomeNorm, instituicao_id]);
        const insertId = result.insertId;
        const [rows] = yield database_1.default.query('SELECT id, nome, instituicao_id FROM Cursos WHERE id = ?', [insertId]);
        res.status(201).json(rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createCourse = createCourse;
const updateCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courseId = Number(req.params.id);
        const { nome } = req.body;
        const updatedCourse = yield institutionCourseService.updateCourse(courseId, nome);
        res.status(200).json({ message: 'Curso atualizado com sucesso!', course: updatedCourse });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateCourse = updateCourse;
const deleteCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courseId = Number(req.params.id);
        yield institutionCourseService.deleteCourse(courseId);
        res.status(200).json({ message: 'Curso desativado com sucesso!' });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.deleteCourse = deleteCourse;
const getCoursesByInstitution = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const courses = yield institutionCourseService.getCoursesByInstitution(Number(id));
        res.status(200).json(courses);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao buscar cursos da instituição.', error: error.message });
    }
});
exports.getCoursesByInstitution = getCoursesByInstitution;
const getInstitutionsNearby = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lat, lon, radius = 100 } = req.query; // Default radius to 100km
        if (!lat || !lon) {
            return res.status(400).json({ message: 'Latitude e longitude são obrigatórias.' });
        }
        const nearbyInstitutions = yield institutionCourseService.getInstitutionsNearby(Number(lat), Number(lon), Number(radius));
        res.status(200).json(nearbyInstitutions);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao buscar instituições próximas.', error: error.message });
    }
});
exports.getInstitutionsNearby = getInstitutionsNearby;
const mergeInstitution = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sourceId, destinationId } = req.body;
        if (!sourceId || !destinationId) {
            return res.status(400).json({ message: 'IDs de origem e destino são obrigatórios.' });
        }
        yield institutionCourseService.mergeInstitution(Number(sourceId), Number(destinationId));
        res.status(200).json({ message: 'Instituições mescladas com sucesso!' });
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao mesclar instituições.', error: error.message });
    }
});
exports.mergeInstitution = mergeInstitution;
const mergeCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sourceId, destinationId } = req.body;
        if (!sourceId || !destinationId) {
            return res.status(400).json({ message: 'IDs de origem e destino são obrigatórios.' });
        }
        yield institutionCourseService.mergeCourse(Number(sourceId), Number(destinationId));
        res.status(200).json({ message: 'Cursos mesclados com sucesso!' });
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao mesclar cursos.', error: error.message });
    }
});
exports.mergeCourse = mergeCourse;
