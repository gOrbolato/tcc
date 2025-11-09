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
exports.downloadReportPdf = exports.getInstitutionAnalysis = void 0;
const analysisService = __importStar(require("../services/analysisService"));
const getInstitutionAnalysis = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { currentStart, currentEnd, previousStart, previousEnd } = req.query;
        if (!id) {
            return res.status(400).json({ message: 'O ID da instituição é obrigatório.' });
        }
        const options = {
            currentStart: currentStart,
            currentEnd: currentEnd,
            previousStart: previousStart,
            previousEnd: previousEnd,
        };
        const analysisResult = yield analysisService.generateAnalysisForInstitution(Number(id), options);
        res.status(200).json(analysisResult);
    }
    catch (error) {
        console.error('Erro no controller de análise:', error);
        res.status(500).json({ message: 'Erro ao gerar a análise.', error: error.message });
    }
});
exports.getInstitutionAnalysis = getInstitutionAnalysis;
const downloadReportPdf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { currentStart, currentEnd, previousStart, previousEnd } = req.query;
        if (!id) {
            return res.status(400).json({ message: 'O ID da instituição é obrigatório.' });
        }
        const options = {
            currentStart: currentStart,
            currentEnd: currentEnd,
            previousStart: previousStart,
            previousEnd: previousEnd,
        };
        const pdfBuffer = yield analysisService.generatePdfReport(Number(id), options);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="relatorio_avaliacao.pdf"');
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('Erro ao gerar PDF no controller:', error);
        res.status(500).json({ message: 'Erro ao gerar o PDF do relatório.', error: error.message });
    }
});
exports.downloadReportPdf = downloadReportPdf;
