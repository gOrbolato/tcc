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
exports.generateAnalysisForInstitution = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("../config/database"));
const generateAnalysisForInstitution = (institutionId) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Buscar todas as avaliações para a instituição
    const [evaluations] = yield database_1.default.query('SELECT * FROM Avaliacoes WHERE instituicao_id = ?', [institutionId]);
    if (evaluations.length === 0) {
        return {
            suggestions: [],
            averages_by_question: {},
            analysis_by_question: {},
        };
    }
    // 2. Executar o script Python como um processo filho
    return new Promise((resolve, reject) => {
        const scriptPath = path_1.default.join(__dirname, '..', 'python_scripts', 'analyze_evaluations.py');
        const pythonProcess = (0, child_process_1.spawn)('python', [scriptPath]);
        let resultJson = '';
        let errorOutput = '';
        // 3. Enviar os dados das avaliações para o stdin do script
        pythonProcess.stdin.write(JSON.stringify(evaluations));
        pythonProcess.stdin.end();
        // 4. Capturar a saída (stdout) do script
        pythonProcess.stdout.on('data', (data) => {
            resultJson += data.toString();
        });
        // Capturar erros
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        // 5. Quando o processo terminar, resolver a Promise com o resultado
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}`);
                console.error(errorOutput);
                return reject(new Error(`Erro ao executar o script de análise: ${errorOutput}`));
            }
            try {
                const result = JSON.parse(resultJson);
                resolve(result);
            }
            catch (e) {
                reject(new Error('Falha ao parsear o resultado do script Python.'));
            }
        });
    });
});
exports.generateAnalysisForInstitution = generateAnalysisForInstitution;
