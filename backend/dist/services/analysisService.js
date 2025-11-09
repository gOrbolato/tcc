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
exports.generateAnalysisForInstitution = exports.generatePdfReport = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("../config/database"));
const generatePdfReport = (institutionId_1, ...args_1) => __awaiter(void 0, [institutionId_1, ...args_1], void 0, function* (institutionId, options = {}) {
    const reportData = yield (0, exports.generateAnalysisForInstitution)(institutionId, options);
    return new Promise((resolve, reject) => {
        const scriptPath = path_1.default.join(__dirname, '..', '..', 'python_scripts', 'generate_pdf.py');
        const pythonProcess = (0, child_process_1.spawn)('C:\\Users\\GuilhermeOrbolato\\AppData\\Local\\Programs\\Python\\Python311\\python.exe', [scriptPath]);
        let pdfBuffer = Buffer.alloc(0);
        let errorOutput = '';
        pythonProcess.stdin.write(JSON.stringify(reportData));
        pythonProcess.stdin.end();
        pythonProcess.stdout.on('data', (data) => {
            pdfBuffer = Buffer.concat([pdfBuffer, data]);
        });
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python PDF script exited with code ${code}`);
                console.error(errorOutput);
                return reject(new Error(`Erro ao gerar PDF: ${errorOutput}`));
            }
            if (pdfBuffer.length === 0) {
                return reject(new Error('Script Python não retornou dados de PDF.'));
            }
            resolve(pdfBuffer);
        });
        pythonProcess.on('error', (err) => {
            console.error('Erro ao iniciar o processo Python para PDF:', err);
            reject(new Error(`Falha ao iniciar o gerador de PDF: ${err.message}`));
        });
    });
});
exports.generatePdfReport = generatePdfReport;
const generateAnalysisForInstitution = (institutionId_1, ...args_1) => __awaiter(void 0, [institutionId_1, ...args_1], void 0, function* (institutionId, options = {}) {
    const fetchEvaluations = (startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
        let query = 'SELECT * FROM Avaliacoes WHERE instituicao_id = ?';
        const params = [institutionId];
        if (startDate && endDate) {
            query += ' AND criado_em BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }
        const [evaluations] = yield database_1.default.query(query, params);
        return evaluations;
    });
    const currentEvaluations = yield fetchEvaluations(options.currentStart, options.currentEnd);
    if (currentEvaluations.length === 0) {
        return {
            suggestions: [],
            averages_by_question: {},
            analysis_by_question: {},
            total_evaluations: { value: 0, delta: null },
            average_media_final: { value: 0, delta: null },
            score_distribution: {},
            executive_summary: "Não há dados de avaliação para o período selecionado.",
            raw_data: [],
        };
    }
    const previousEvaluations = yield fetchEvaluations(options.previousStart, options.previousEnd);
    // NEW: Filter to keep only the latest evaluation per user for analysis
    const filterLatestEvaluationPerUser = (evaluations) => {
        const latestEvaluationsMap = new Map(); // Map<userId, latestEvaluation>
        for (const evalItem of evaluations) {
            const userId = evalItem.usuario_id;
            const createdAt = new Date(evalItem.criado_em);
            if (!latestEvaluationsMap.has(userId) || createdAt > new Date(latestEvaluationsMap.get(userId).criado_em)) {
                latestEvaluationsMap.set(userId, evalItem);
            }
        }
        return Array.from(latestEvaluationsMap.values());
    };
    const filteredCurrentEvaluations = filterLatestEvaluationPerUser(currentEvaluations);
    const filteredPreviousEvaluations = filterLatestEvaluationPerUser(previousEvaluations);
    const dataForPython = {
        current: filteredCurrentEvaluations,
        previous: filteredPreviousEvaluations,
    };
    return new Promise((resolve, reject) => {
        const scriptPath = path_1.default.join(__dirname, '..', '..', 'python_scripts', 'analyze_evaluations.py');
        const pythonProcess = (0, child_process_1.spawn)('C:\\Users\\GuilhermeOrbolato\\AppData\\Local\\Programs\\Python\\Python311\\python.exe', [scriptPath]);
        let resultJson = '';
        let errorOutput = '';
        pythonProcess.stdin.write(JSON.stringify(dataForPython));
        pythonProcess.stdin.end();
        pythonProcess.stdout.setEncoding('utf8');
        pythonProcess.stdout.on('data', (data) => {
            resultJson += data;
        });
        pythonProcess.stderr.setEncoding('utf8');
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data;
        });
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}`);
                console.error(errorOutput);
                return reject(new Error(`Erro ao executar o script de análise: ${errorOutput}`));
            }
            try {
                console.log(`--- DEBUG: Raw Python stdout ---\n${resultJson}`);
                if (!resultJson) {
                    console.error("Python script returned empty stdout.");
                    return reject(new Error("Python script returned empty stdout."));
                }
                const result = JSON.parse(resultJson);
                console.log(`--- DEBUG: Parsed Python result ---\n${JSON.stringify(result, null, 2)}`);
                resolve(result);
            }
            catch (e) {
                console.error('Falha ao parsear o resultado do script Python:', e);
                console.error('Raw output que causou o erro:', resultJson);
                reject(new Error('Falha ao parsear o resultado do script Python.'));
            }
        });
    });
});
exports.generateAnalysisForInstitution = generateAnalysisForInstitution;
