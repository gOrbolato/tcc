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
exports.getEvaluationStatus = exports.getUserCompleted = exports.getUserAvailable = exports.getTemplate = exports.getMyEvaluations = exports.getEvaluations = void 0;
const evaluationService = __importStar(require("../services/evaluationService"));
const userEvaluationService = __importStar(require("../services/userEvaluationService"));
const userService = __importStar(require("../services/userService"));
const getEvaluations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Os filtros virão da query string da URL
        const filters = {
            institutionId: req.query.institutionId,
            courseId: req.query.courseId,
            latitude: req.query.lat,
            longitude: req.query.lon,
            radius: req.query.radius,
            anonymizedId: req.query.anonymizedId,
        };
        const evaluations = yield evaluationService.getFilteredEvaluations(filters);
        res.status(200).json(evaluations);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao buscar avaliações.', error: error.message });
    }
});
exports.getEvaluations = getEvaluations;
const getMyEvaluations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }
        const evaluations = yield evaluationService.getEvaluationsByUserId(req.user.id);
        res.status(200).json(evaluations);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao buscar suas avaliações.', error: error.message });
    }
});
exports.getMyEvaluations = getMyEvaluations;
const getTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Não autorizado.' });
        }
        const user = yield userService.getUserById(req.user.id);
        // Simple, hard-coded template for the evaluation form. In future this should come from DB.
        const template = {
            professor: null,
            instituicao_id: user.instituicao_id,
            curso_id: user.curso_id,
            questoes: [
                // Instituição (101-108)
                { id: 101, texto: 'Infraestrutura geral (salas, cantina ou refeitório, etc.)', tipo: 'ESCOLHA_UNICA' },
                { id: 102, texto: 'Qualidade e modernização dos laboratórios', tipo: 'ESCOLHA_UNICA' },
                { id: 103, texto: 'Estrutura e acervo da biblioteca', tipo: 'ESCOLHA_UNICA' },
                { id: 104, texto: 'Suporte para mercado de trabalho (auxílio com estágio)', tipo: 'ESCOLHA_UNICA' },
                { id: 105, texto: 'Localização e facilidade de acesso', tipo: 'ESCOLHA_UNICA' },
                { id: 106, texto: 'Acessibilidade para pessoas com deficiência', tipo: 'ESCOLHA_UNICA' },
                { id: 107, texto: 'Acessibilidade e prestatividade da direção', tipo: 'ESCOLHA_UNICA' },
                { id: 108, texto: 'Acessibilidade e prestatividade da coordenação', tipo: 'ESCOLHA_UNICA' },
                // Curso (109-112)
                { id: 109, texto: 'Didática e clareza dos professores', tipo: 'ESCOLHA_UNICA' },
                { id: 110, texto: 'Dinamismo dos professores nas explicações da matéria', tipo: 'ESCOLHA_UNICA' },
                { id: 111, texto: 'Disponibilidade dos professores para dúvidas', tipo: 'ESCOLHA_UNICA' },
                { id: 112, texto: 'Relevância e atualização de conteúdo das matérias', tipo: 'ESCOLHA_UNICA' },
            ],
        };
        res.status(200).json(template);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao obter template de avaliação.', error: error.message });
    }
});
exports.getTemplate = getTemplate;
const getUserAvailable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Placeholder: backend currently doesn't have "available" logic. Return empty list for now.
        res.status(200).json([]);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao obter avaliações disponíveis.', error: error.message });
    }
});
exports.getUserAvailable = getUserAvailable;
const getUserCompleted = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.id)
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        const evaluations = yield evaluationService.getEvaluationsByUserId(req.user.id);
        res.status(200).json(evaluations);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao obter avaliações concluídas.', error: error.message });
    }
});
exports.getUserCompleted = getUserCompleted;
const getEvaluationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Não autorizado.' });
        }
        const status = yield userEvaluationService.getUserEvaluationStatus(req.user.id);
        res.status(200).json(status);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getEvaluationStatus = getEvaluationStatus;
