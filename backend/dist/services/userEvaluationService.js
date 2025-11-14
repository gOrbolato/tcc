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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserEvaluationStatus = exports.getEvaluationDetails = exports.submitEvaluation = void 0;
const database_1 = __importDefault(require("../config/database"));
const submitEvaluation = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const [userRows] = yield database_1.default.query('SELECT is_active FROM Usuarios WHERE id = ?', [data.userId]);
    if (userRows.length === 0 || !userRows[0].is_active) {
        throw new Error('Sua conta está trancada e não pode enviar novas avaliações.');
    }
    const [lastEvaluation] = yield database_1.default.query('SELECT criado_em FROM Avaliacoes WHERE usuario_id = ? ORDER BY criado_em DESC LIMIT 1', [data.userId]);
    if (lastEvaluation.length > 0) {
        const lastEvalDate = new Date(lastEvaluation[0].criado_em);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        if (lastEvalDate > sixtyDaysAgo) {
            throw new Error('Você só pode enviar uma nova avaliação a cada 60 dias.');
        }
    }
    const { userId, instituicao_id, curso_id } = data, answers = __rest(data, ["userId", "instituicao_id", "curso_id"]);
    // Mapping from question IDs (used in frontend/template) to DB category keys
    const QUESTION_ID_TO_KEY = {
        '101': 'infraestrutura',
        '102': 'equipamentos',
        '103': 'biblioteca',
        '104': 'suporte_mercado',
        '105': 'localizacao',
        '106': 'acessibilidade',
        '107': 'direcao',
        '108': 'coordenacao',
        '109': 'didatica', // CORRECTED: removed accent
        '110': 'dinamica_professores', // CORRECTED: removed accent
        '111': 'disponibilidade_professores',
        '112': 'conteudo', // CORRECTED: removed accent
    };
    // Convert incoming answers like nota_<id> and comentario_<id> into nota_<category> / comentario_<category>
    const normalizedAnswers = {};
    Object.entries(answers).forEach(([key, value]) => {
        // If key already matches the category format (e.g., nota_infraestrutura), keep as is
        if (key.startsWith('nota_') || key.startsWith('comentario_')) {
            const suffix = key.split('_')[1];
            // If suffix is numeric (id), map it
            if (/^\d+$/.test(suffix)) {
                const mapped = QUESTION_ID_TO_KEY[suffix];
                if (mapped) {
                    const newKey = key.startsWith('nota_') ? `nota_${mapped}` : `comentario_${mapped}`;
                    normalizedAnswers[newKey] = value;
                }
                else {
                    // unknown question id; skip or keep under original key to avoid data loss
                    normalizedAnswers[key] = value;
                }
            }
            else {
                // already a category key (e.g., nota_infraestrutura)
                normalizedAnswers[key] = value;
            }
        }
        else {
            // other fields (if any) — keep them
            normalizedAnswers[key] = value;
        }
    });
    // Only keep expected answer keys (nota_*, comentario_*) to avoid inserting unrelated fields
    const allowedAnswerEntries = Object.entries(normalizedAnswers).filter(([k, v]) => {
        if (/^(nota_|comentario_)/.test(k))
            return true;
        // log unexpected keys for debugging
        console.warn(`Ignoring unexpected answer field when building INSERT: ${k}`);
        return false;
    });
    // Extract grades from normalized keys
    const grades = allowedAnswerEntries
        .filter(([k]) => k.startsWith('nota_'))
        .map(([, v]) => Number(v));
    const media_final = grades.length > 0 ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length : 0;
    const answerKeys = allowedAnswerEntries.map(([k]) => k);
    const answerValues = allowedAnswerEntries.map(([, v]) => v);
    const columns = ['usuario_id', 'instituicao_id', 'curso_id', 'media_final', ...answerKeys];
    const placeholders = columns.map(() => '?').join(', ');
    const values = [userId, instituicao_id, curso_id, media_final, ...answerValues];
    const query = `INSERT INTO Avaliacoes (${columns.join(', ')}) VALUES (${placeholders});`;
    // Log para depuração
    console.log('--- DEBUG: Valores sendo inseridos na tabela Avaliacoes: ---', values);
    console.log('--- DEBUG: SQL a executar ---', query);
    const [result] = yield database_1.default.query(query, values);
    const insertId = result.insertId;
    // Bulk insert into AvaliacaoRespostas: one row per nota/comment pair
    try {
        const respostaRows = [];
        allowedAnswerEntries.forEach(([k, v]) => {
            // k is like 'nota_infraestrutura' or 'comentario_infraestrutura'
            const m = k.match(/^(nota|comentario)_(.+)$/);
            if (!m)
                return;
            const [, kind, key] = m; // kind='nota'|'comentario', key='infraestrutura'
            // find or create an entry in a temp map
        });
        // We'll build a map question_key -> { nota, comentario }
        const respMap = {};
        allowedAnswerEntries.forEach(([k, v]) => {
            const m = k.match(/^(nota|comentario)_(.+)$/);
            if (!m)
                return;
            const [, kind, key] = m;
            if (!respMap[key])
                respMap[key] = {};
            if (kind === 'nota')
                respMap[key].nota = v;
            else
                respMap[key].comentario = v;
        });
        Object.entries(respMap).forEach(([question_key, obj]) => {
            var _a, _b;
            // question_id is unknown for custom templates; we leave it NULL
            respostaRows.push([insertId, null, question_key, (_a = obj.nota) !== null && _a !== void 0 ? _a : null, (_b = obj.comentario) !== null && _b !== void 0 ? _b : null]);
        });
        if (respostaRows.length > 0) {
            const placeholdersRows = respostaRows.map(() => '(?, ?, ?, ?, ?)').join(', ');
            const flatValues = [];
            respostaRows.forEach(r => flatValues.push(...r));
            const respQuery = `INSERT INTO AvaliacaoRespostas (avaliacao_id, question_id, question_key, nota, comentario) VALUES ${placeholdersRows}`;
            yield database_1.default.query(respQuery, flatValues);
        }
    }
    catch (e) {
        console.error('Erro ao inserir AvaliacaoRespostas:', e);
        // do not fail the whole transaction; evaluation was saved. Consider retry background job.
    }
    return { id: insertId };
});
exports.submitEvaluation = submitEvaluation;
const getEvaluationDetails = (evaluationId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const [evaluationRows] = yield database_1.default.query('SELECT * FROM Avaliacoes WHERE id = ? AND usuario_id = ?', [evaluationId, userId]);
    if (evaluationRows.length === 0) {
        throw new Error('Avaliação não encontrada ou não pertence a este usuário.');
    }
    const evaluation = evaluationRows[0];
    const [answerRows] = yield database_1.default.query('SELECT question_key, nota, comentario FROM AvaliacaoRespostas WHERE avaliacao_id = ?', [evaluationId]);
    const respostas = answerRows.map(row => ({
        questaoTexto: row.question_key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()), // Capitalize words
        nota: row.nota !== null ? Number(row.nota) : null,
        comentario: row.comentario || null,
        tipo: row.nota !== null ? 'ESCOLHA_UNICA' : (row.comentario ? 'TEXTO_LIVRE' : 'ESCOLHA_UNICA'),
    }));
    return {
        professor: '', // This field is not available
        respostas: respostas,
        criado_em: evaluation.criado_em,
        media_final: evaluation.media_final,
    };
});
exports.getEvaluationDetails = getEvaluationDetails;
const getUserEvaluationStatus = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const [lastEvaluation] = yield database_1.default.query('SELECT criado_em FROM Avaliacoes WHERE usuario_id = ? ORDER BY criado_em DESC LIMIT 1', [userId]);
    if (lastEvaluation.length === 0) {
        return { canEvaluate: true, lastEvaluationDate: null, daysRemaining: 0 };
    }
    const lastEvalDate = new Date(lastEvaluation[0].criado_em);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const canEvaluate = lastEvalDate < sixtyDaysAgo;
    let daysRemaining = 0;
    if (!canEvaluate) {
        const nextAvailableDate = new Date(lastEvalDate);
        nextAvailableDate.setDate(nextAvailableDate.getDate() + 60);
        const today = new Date();
        daysRemaining = Math.ceil((nextAvailableDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }
    return { canEvaluate, lastEvaluationDate: lastEvalDate, daysRemaining };
});
exports.getUserEvaluationStatus = getUserEvaluationStatus;
