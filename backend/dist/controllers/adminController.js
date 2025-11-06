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
exports.updateAdminProfile = exports.getAdminNotifications = exports.getAdminReports = exports.downloadReport = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const adminService = __importStar(require("../services/adminService"));
// Função para gerar e baixar o relatório PDF
const downloadReport = (req, res) => {
    const scriptPath = path_1.default.join(__dirname, '../scripts/generate_report.py');
    // 1. Verifica se o script Python existe
    if (!fs_1.default.existsSync(scriptPath)) {
        console.error('Erro Crítico: O script de geração de relatório (generate_report.py) não foi encontrado.');
        return res.status(500).json({
            message: 'Erro interno no servidor. A funcionalidade de relatório não está configurada corretamente.',
        });
    }
    // 2. Tenta executar o script
    const pythonProcess = (0, child_process_1.spawn)('py', [scriptPath], {
        cwd: path_1.default.join(__dirname, '../../'),
    });
    let stderr = '';
    pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
    });
    pythonProcess.on('close', (code) => {
        // 3. Se o código de saída for diferente de 0, houve um erro
        if (code !== 0) {
            console.error('Erro ao executar o script Python para gerar relatório:', stderr);
            return res.status(500).json({
                message: 'Não foi possível gerar o relatório. Verifique se o Python está instalado e se as dependências em `backend/src/scripts/requirements.txt` foram instaladas corretamente.',
                error: stderr,
            });
        }
        const reportPath = path_1.default.join(__dirname, '../../reports/relatorio_avaliacoes.pdf');
        // 4. Verifica se o arquivo PDF foi realmente criado
        if (!fs_1.default.existsSync(reportPath)) {
            console.error('O script Python executou, mas o arquivo PDF não foi encontrado.');
            return res.status(500).json({ message: 'Erro inesperado ao gerar o arquivo do relatório.' });
        }
        // 5. Envia o arquivo para download
        res.download(reportPath, 'relatorio_avaliacoes.pdf', (err) => {
            if (err) {
                console.error('Erro ao enviar o arquivo PDF para o cliente:', err);
            }
        });
    });
    // Captura erros no spawn do processo (ex: comando 'py' não encontrado)
    pythonProcess.on('error', (error) => {
        console.error('Falha ao iniciar o processo Python:', error);
        res.status(500).json({
            message: 'Erro ao executar o Python. Verifique se o Python está instalado e acessível no PATH do sistema.',
            error: error.message,
        });
    });
};
exports.downloadReport = downloadReport;
// Nova função para buscar dados do relatório administrativo
const getAdminReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filters = {
            institutionId: req.query.institutionId,
            courseId: req.query.courseId,
        };
        const reportData = yield adminService.getAdminReportData(filters);
        res.status(200).json(reportData);
    }
    catch (error) {
        console.error("Erro ao buscar dados do relatório administrativo:", error);
        res.status(500).json({ message: 'Erro ao buscar dados do relatório administrativo.', error: error.message });
    }
});
exports.getAdminReports = getAdminReports;
// Nova função para buscar notificações administrativas
const getAdminNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notifications = yield adminService.getPendingNotifications();
        res.status(200).json(notifications);
    }
    catch (error) {
        console.error("Erro ao buscar notificações administrativas:", error);
        res.status(500).json({ message: 'Erro ao buscar notificações administrativas.', error: error.message });
    }
});
exports.getAdminNotifications = getAdminNotifications;
const updateAdminProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Não autorizado.' });
        }
        const { nome, email } = req.body;
        const updatedAdmin = yield adminService.updateAdminProfile(req.user.id, { nome, email });
        res.status(200).json({ message: 'Perfil do admin atualizado com sucesso!', user: updatedAdmin });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateAdminProfile = updateAdminProfile;
