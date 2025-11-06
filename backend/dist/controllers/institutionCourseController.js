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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstitutionsNearby = exports.getCoursesByInstitution = exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.deleteInstitution = exports.updateInstitution = exports.createInstitution = exports.getCourses = exports.getInstitutions = void 0;
const institutionCourseService = __importStar(require("../services/institutionCourseService"));
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
const createInstitution = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(501).json({ message: 'Not Implemented' });
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
const createCourse = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(501).json({ message: 'Not Implemented' });
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
const getCoursesByInstitution = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(501).json({ message: 'Not Implemented' });
});
exports.getCoursesByInstitution = getCoursesByInstitution;
const getInstitutionsNearby = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { latitude, longitude, radius } = req.query;
        if (!latitude || !longitude || !radius) {
            return res.status(400).json({ message: 'Latitude, longitude e raio são obrigatórios.' });
        }
        const nearbyInstitutions = yield institutionCourseService.getInstitutionsNearby(Number(latitude), Number(longitude), Number(radius));
        res.status(200).json(nearbyInstitutions);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao buscar instituições próximas.', error: error.message });
    }
});
exports.getInstitutionsNearby = getInstitutionsNearby;
