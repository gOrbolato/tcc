// Importa a pool de conexões do banco de dados.
import pool from '../config/database';
// Importa os tipos OkPacket e RowDataPacket do mysql2 para tipar os resultados das queries.
import { OkPacket, RowDataPacket } from 'mysql2';

// Interface para os dados da avaliação.
interface EvaluationData {
  userId: number;
  instituicao_id: number;
  curso_id: number;
  [key: string]: any;
}

/**
 * @function submitEvaluation
 * @description Submete uma nova avaliação de um usuário, verificando o status da conta e o cooldown de 60 dias.
 * @param {EvaluationData} data - Os dados da avaliação.
 * @returns {Promise<{ id: number }>} - O ID da avaliação inserida.
 */
export const submitEvaluation = async (data: EvaluationData): Promise<{ id: number }> => {
  const [userRows] = await pool.query<RowDataPacket[]>('SELECT is_active FROM Usuarios WHERE id = ?', [data.userId]);
  if (userRows.length === 0 || !userRows[0].is_active) {
    throw new Error('Sua conta está trancada e não pode enviar novas avaliações.');
  }

  const [lastEvaluation] = await pool.query<RowDataPacket[]>('SELECT criado_em FROM Avaliacoes WHERE usuario_id = ? ORDER BY criado_em DESC LIMIT 1', [data.userId]);
  if (lastEvaluation.length > 0) {
    const lastEvalDate = new Date(lastEvaluation[0].criado_em);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    if (lastEvalDate > sixtyDaysAgo) {
      throw new Error('Você só pode enviar uma nova avaliação a cada 60 dias.');
    }
  }

  const { userId, instituicao_id, curso_id, ...answers } = data;

  // Mapeia os IDs das questões do frontend para as chaves de categoria do banco de dados.
  const QUESTION_ID_TO_KEY: Record<string, string> = {
    '101': 'infraestrutura', '102': 'equipamentos', '103': 'biblioteca', '104': 'suporte_mercado',
    '105': 'localizacao', '106': 'acessibilidade', '107': 'direcao', '108': 'coordenacao',
    '109': 'didatica', '110': 'dinamica_professores', '111': 'disponibilidade_professores', '112': 'conteudo',
  };

  const normalizedAnswers: Record<string, any> = {};
  Object.entries(answers).forEach(([key, value]) => {
    if (key.startsWith('nota_') || key.startsWith('comentario_')) {
      const suffix = key.split('_')[1];
      if (/^\d+$/.test(suffix)) {
        const mapped = QUESTION_ID_TO_KEY[suffix];
        if (mapped) {
          const newKey = key.startsWith('nota_') ? `nota_${mapped}` : `comentario_${mapped}`;
          normalizedAnswers[newKey] = value;
        } else {
          normalizedAnswers[key] = value;
        }
      } else {
        normalizedAnswers[key] = value;
      }
    } else {
      normalizedAnswers[key] = value;
    }
  });

  const allowedAnswerEntries = Object.entries(normalizedAnswers).filter(([k]) => /^(nota_|comentario_)/.test(k));
  const grades = allowedAnswerEntries.filter(([k]) => k.startsWith('nota_')).map(([, v]) => Number(v));
  const media_final = grades.length > 0 ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length : 0;
  const answerKeys = allowedAnswerEntries.map(([k]) => k);
  const answerValues = allowedAnswerEntries.map(([, v]) => v);
  const columns = ['usuario_id', 'instituicao_id', 'curso_id', 'media_final', ...answerKeys];
  const placeholders = columns.map(() => '?').join(', ');
  const values = [userId, instituicao_id, curso_id, media_final, ...answerValues];

  const query = `INSERT INTO Avaliacoes (${columns.join(', ')}) VALUES (${placeholders});`;
  const [result] = await pool.query<OkPacket>(query, values);
  const insertId = result.insertId;

  // Insere as respostas detalhadas na tabela 'AvaliacaoRespostas'.
  try {
    const respostaRows: any[][] = [];
    const respMap: Record<string, { nota?: number | null; comentario?: string | null }> = {};
    allowedAnswerEntries.forEach(([k, v]) => {
      const m = k.match(/^(nota|comentario)_(.+)$/);
      if (!m) return;
      const [, kind, key] = m;
      if (!respMap[key]) respMap[key] = {};
      if (kind === 'nota') respMap[key].nota = v as number;
      else respMap[key].comentario = v as string;
    });

    Object.entries(respMap).forEach(([question_key, obj]) => {
      respostaRows.push([insertId, null, question_key, obj.nota ?? null, obj.comentario ?? null]);
    });

    if (respostaRows.length > 0) {
      const placeholdersRows = respostaRows.map(() => '(?, ?, ?, ?, ?)').join(', ');
      const flatValues = respostaRows.flat();
      const respQuery = `INSERT INTO AvaliacaoRespostas (avaliacao_id, question_id, question_key, nota, comentario) VALUES ${placeholdersRows}`;
      await pool.query(respQuery, flatValues);
    }
  } catch (e) {
    console.error('Erro ao inserir AvaliacaoRespostas:', e);
  }

  return { id: insertId };
};

/**
 * @function getEvaluationDetails
 * @description Busca e retorna os detalhes de uma avaliação específica de um usuário.
 * @param {number} evaluationId - O ID da avaliação.
 * @param {number} userId - O ID do usuário.
 * @returns {Promise<any>} - Os detalhes da avaliação.
 */
export const getEvaluationDetails = async (evaluationId: number, userId: number): Promise<any> => {
  const [evaluationRows] = await pool.query<RowDataPacket[]>('SELECT * FROM Avaliacoes WHERE id = ? AND usuario_id = ?', [evaluationId, userId]);
  if (evaluationRows.length === 0) throw new Error('Avaliação não encontrada ou não pertence a este usuário.');

  const evaluation = evaluationRows[0];
  const [answerRows] = await pool.query<RowDataPacket[]>('SELECT question_key, nota, comentario FROM AvaliacaoRespostas WHERE avaliacao_id = ?', [evaluationId]);

  const respostas = answerRows.map(row => ({
    questaoTexto: row.question_key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    nota: row.nota !== null ? Number(row.nota) : null,
    comentario: row.comentario || null,
    tipo: row.nota !== null ? 'ESCOLHA_UNICA' : (row.comentario ? 'TEXTO_LIVRE' : 'ESCOLHA_UNICA'),
  }));

  return {
    professor: '',
    respostas: respostas,
    criado_em: evaluation.criado_em,
    media_final: evaluation.media_final,
  };
};

/**
 * @function getUserEvaluationStatus
 * @description Verifica se um usuário pode fazer uma nova avaliação e quantos dias faltam.
 * @param {number} userId - O ID do usuário.
 * @returns {Promise<{ canEvaluate: boolean; lastEvaluationDate: Date | null; daysRemaining: number }>} - O status da avaliação do usuário.
 */
export const getUserEvaluationStatus = async (userId: number): Promise<{ canEvaluate: boolean; lastEvaluationDate: Date | null; daysRemaining: number }> => {
  const [lastEvaluation] = await pool.query<RowDataPacket[]>('SELECT criado_em FROM Avaliacoes WHERE usuario_id = ? ORDER BY criado_em DESC LIMIT 1', [userId]);
  if (lastEvaluation.length === 0) return { canEvaluate: true, lastEvaluationDate: null, daysRemaining: 0 };

  const lastEvalDate = new Date(lastEvaluation[0].criado_em);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const canEvaluate = lastEvalDate < sixtyDaysAgo;
  let daysRemaining = 0;
  if (!canEvaluate) {
    const nextAvailableDate = new Date(lastEvalDate);
    nextAvailableDate.setDate(nextAvailableDate.getDate() + 60);
    daysRemaining = Math.ceil((nextAvailableDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  }

  return { canEvaluate, lastEvaluationDate: lastEvalDate, daysRemaining };
};