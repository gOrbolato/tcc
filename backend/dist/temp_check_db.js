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
const database_1 = __importDefault(require("./config/database"));
const checkInstitution = (name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`
Verificando a instituição: "${name}"`);
        const [institutionRows] = yield database_1.default.query('SELECT id FROM Instituicoes WHERE nome = ?', [name]);
        if (institutionRows.length === 0) {
            console.log('  -> Instituição não encontrada no banco de dados.');
            return;
        }
        const institutionId = institutionRows[0].id;
        console.log(`  -> ID da instituição: ${institutionId}`);
        const [evaluationRows] = yield database_1.default.query('SELECT COUNT(*) as count FROM Avaliacoes WHERE instituicao_id = ?', [institutionId]);
        const evaluationCount = evaluationRows[0].count;
        console.log(`  -> Número de avaliações encontradas: ${evaluationCount}`);
    }
    catch (error) {
        console.error(`Erro ao verificar a instituição "${name}":`, error);
    }
});
const runCheck = () => __awaiter(void 0, void 0, void 0, function* () {
    yield checkInstitution('Faculdade de Ciências e Tecnologia - Presidente Prudente');
    yield checkInstitution('Faculdade de Tecnologia de Presidente Prudente');
    yield database_1.default.end(); // Fecha a conexão com o banco de dados
});
runCheck();
