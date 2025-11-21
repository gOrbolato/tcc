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
exports.updateAdminProfile = exports.generateReports = exports.getPendingNotifications = exports.getAdminReportData = void 0;
const database_1 = __importDefault(require("../config/database"));
const child_process_1 = require("child_process");
const getAdminReportData = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    let query = `
    SELECT 
      a.* 
    FROM Avaliacoes a
    WHERE 1=1
  `;
    const params = [];
    if (filters.institutionId) {
        query += ' AND a.instituicao_id = ?';
        params.push(filters.institutionId);
    }
    if (filters.courseId) {
        query += ' AND a.curso_id = ?';
        params.push(filters.courseId);
    }
    const [evaluations] = yield database_1.default.query(query, params);
    if (evaluations.length === 0) {
        return {
            average_media_final: 0,
            total_evaluations: 0,
            averages_by_question: {},
            suggestions: [],
            score_distribution: {},
            raw_data: [],
        };
    }
    const total_evaluations = evaluations.length;
    const sum_media_final = evaluations.reduce((sum, ev) => sum + (Number(ev.media_final) || 0), 0);
    const average_media_final = sum_media_final / total_evaluations;
    const score_distribution = evaluations.reduce((acc, ev) => {
        const score = Math.round(ev.media_final);
        acc[score] = (acc[score] || 0) + 1;
        return acc;
    }, {});
    const raw_data = evaluations.map(ev => ({
        id: ev.id,
        comentario_geral: ev.comentario_geral,
        media_final: ev.media_final,
        created_at: ev.created_at,
    }));
    // Chamar o script Python para análise avançada
    const pythonAnalysis = yield new Promise((resolve, reject) => {
        const pythonProcess = (0, child_process_1.spawn)('C:\\Users\\GuilhermeOrbolato\\AppData\\Local\\Programs\\Python\\Python311\\python.exe', ['./python_scripts/analyze_evaluations.py'], {
            cwd: __dirname + '/../../',
        });
        let pythonOutput = '';
        let pythonError = '';
        pythonProcess.stdout.on('data', (data) => { pythonOutput += data.toString(); });
        pythonProcess.stderr.on('data', (data) => { pythonError += data.toString(); });
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}: ${pythonError}`);
                return reject(new Error(`Erro na análise Python: ${pythonError}`));
            }
            try {
                const result = JSON.parse(pythonOutput);
                resolve(result);
            }
            catch (parseError) {
                console.error('Erro ao parsear saída do Python:', parseError);
                reject(new Error('Erro ao processar resultados da análise.'));
            }
        });
        // Envia os dados das avaliações para o script Python via stdin
        pythonProcess.stdin.write(JSON.stringify(evaluations));
        pythonProcess.stdin.end();
    });
    return {
        average_media_final,
        total_evaluations,
        averages_by_question: pythonAnalysis.averages_by_question,
        suggestions: pythonAnalysis.suggestions,
        analysis_by_question: pythonAnalysis.analysis_by_question,
        score_distribution,
        raw_data,
    };
});
exports.getAdminReportData = getAdminReportData;
const getPendingNotifications = () => __awaiter(void 0, void 0, void 0, function* () {
    const [notifications] = yield database_1.default.query(`SELECT 
        n.id, n.usuario_id, n.mensagem, n.lida, n.criado_em, 
        u.nome, u.ra 
    FROM Notificacoes n
    JOIN Usuarios u ON n.usuario_id = u.id
    WHERE n.lida = FALSE
    ORDER BY n.criado_em DESC`);
    return notifications;
});
exports.getPendingNotifications = getPendingNotifications;
const generateReports = () => __awaiter(void 0, void 0, void 0, function* () {
    const [evaluations] = yield database_1.default.query(`SELECT
        a.nota_infraestrutura, a.obs_infraestrutura, a.nota_material_didatico,
        a.obs_material_didatico, a.media_final, i.nome AS instituicao_nome, c.nome AS curso_nome
    FROM Avaliacoes a
    JOIN Instituicoes i ON a.instituicao_id = i.id
    JOIN Cursos c ON a.curso_id = c.id`);
    // Se não houver avaliações, retorna um objeto de relatório padrão imediatamente.
    if (evaluations.length === 0) {
        return {
            average_media_final: 0,
            average_nota_infraestrutura: 0,
            average_nota_material_didatico: 0,
            total_evaluations: 0,
            evaluations_by_institution: {},
            word_cloud: {},
        };
    }
    // Se houver avaliações, prossegue com a análise Python
    return new Promise((resolve, reject) => {
        const pythonProcess = (0, child_process_1.spawn)('C:\\Users\\GuilhermeOrbolato\\AppData\\Local\\Programs\\Python\\Python311\\python.exe', ['./python_scripts/analyze_evaluations.py'], {
            cwd: __dirname + '/../../',
        });
        let pythonOutput = '';
        let pythonError = '';
        pythonProcess.stdout.on('data', (data) => { pythonOutput += data.toString(); });
        pythonProcess.stderr.on('data', (data) => { pythonError += data.toString(); });
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}: ${pythonError}`);
                return reject(new Error(`Erro na análise Python: ${pythonError}`));
            }
            try {
                const result = JSON.parse(pythonOutput);
                resolve(result);
            }
            catch (parseError) {
                console.error('Erro ao parsear saída do Python:', parseError);
                reject(new Error('Erro ao processar resultados da análise.'));
            }
        });
        pythonProcess.stdin.write(JSON.stringify(evaluations));
        pythonProcess.stdin.end();
    });
});
exports.generateReports = generateReports;
const updateAdminProfile = (adminId, data) => __awaiter(void 0, void 0, void 0, function* () {
    if (!data.nome) {
        throw new Error('O nome é obrigatório.');
    }
    yield database_1.default.query('UPDATE Admins SET nome = ? WHERE id = ?', [data.nome, adminId]);
    const [updatedAdminRows] = yield database_1.default.query('SELECT id, nome, email FROM Admins WHERE id = ?', [adminId]);
    return Object.assign(Object.assign({}, updatedAdminRows[0]), { isAdmin: true });
});
exports.updateAdminProfile = updateAdminProfile;
