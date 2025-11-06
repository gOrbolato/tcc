import pool from '../config/database';
import { OkPacket, RowDataPacket } from 'mysql2';

interface EvaluationData {
  userId: number;
  instituicao_id: number;
  curso_id: number;
  [key: string]: any;
}

export const submitEvaluation = async (data: EvaluationData) => {
  const [userRows] = await pool.query<RowDataPacket[]>('SELECT is_active FROM Usuarios WHERE id = ?', [data.userId]);
  if (userRows.length === 0 || !userRows[0].is_active) {
    throw new Error('Sua conta está trancada e não pode enviar novas avaliações.');
  }

  const [lastEvaluation] = await pool.query<RowDataPacket[]>(
    'SELECT criado_em FROM Avaliacoes WHERE usuario_id = ? ORDER BY criado_em DESC LIMIT 1',
    [data.userId]
  );

  if (lastEvaluation.length > 0) {
    const lastEvalDate = new Date(lastEvaluation[0].criado_em);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    if (lastEvalDate > sixtyDaysAgo) {
      throw new Error('Você só pode enviar uma nova avaliação a cada 60 dias.');
    }
  }

  const { userId, instituicao_id, curso_id, ...answers } = data;

  // Mapping from question IDs (used in frontend/template) to DB category keys
  const QUESTION_ID_TO_KEY: Record<string, string> = {
    '101': 'infraestrutura',
    '102': 'equipamentos',
    '103': 'biblioteca',
    '104': 'suporte_mercado',
    '105': 'localizacao',
    '106': 'acessibilidade',
    '107': 'direcao',
    '108': 'coordenacao',
    '109': 'didatica',
    '110': 'dinamica_professores',
    '111': 'disponibilidade_professores',
    '112': 'conteudo',
  };

  // Convert incoming answers like nota_<id> and comentario_<id> into nota_<category> / comentario_<category>
  const normalizedAnswers: Record<string, any> = {};

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
        } else {
          // unknown question id; skip or keep under original key to avoid data loss
          normalizedAnswers[key] = value;
        }
      } else {
        // already a category key (e.g., nota_infraestrutura)
        normalizedAnswers[key] = value;
      }
    } else {
      // other fields (if any) — keep them
      normalizedAnswers[key] = value;
    }
  });

  // Only keep expected answer keys (nota_*, comentario_*) to avoid inserting unrelated fields
  const allowedAnswerEntries = Object.entries(normalizedAnswers).filter(([k, v]) => {
    if (/^(nota_|comentario_)/.test(k)) return true;
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

  // Prepare final columns/placeholders/values (mutable copies)
  const fullColumns = [...columns];
  const fullValues = [...values];
  let fullPlaceholders = placeholders;

  const respostaRaw = answers && Object.keys(answers).length > 0 ? answers : null;
  if (respostaRaw) {
    fullColumns.push('resposta_raw');
    fullPlaceholders = fullPlaceholders + ', ?';
    fullValues.push(JSON.stringify(respostaRaw));
  }
  if ((data as any).template_id) {
    fullColumns.push('template_id');
    fullPlaceholders = fullPlaceholders + ', ?';
    fullValues.push((data as any).template_id);
  }

  const query = `INSERT INTO Avaliacoes (${fullColumns.join(', ')}) VALUES (${fullPlaceholders});`;

  // Log para depuração
  console.log('--- DEBUG: Valores sendo inseridos na tabela Avaliacoes: ---', fullValues);
  console.log('--- DEBUG: SQL a executar ---', query);

  const [result] = await pool.query<OkPacket>(query, fullValues);
  const insertId = result.insertId;

  // Bulk insert into AvaliacaoRespostas: one row per nota/comment pair
  try {
    const respostaRows: Array<any[]> = [];
    allowedAnswerEntries.forEach(([k, v]) => {
      // k is like 'nota_infraestrutura' or 'comentario_infraestrutura'
      const m = k.match(/^(nota|comentario)_(.+)$/);
      if (!m) return;
      const [, kind, key] = m; // kind='nota'|'comentario', key='infraestrutura'
      // find or create an entry in a temp map
    });

    // We'll build a map question_key -> { nota, comentario }
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
      // question_id is unknown for custom templates; we leave it NULL
      respostaRows.push([insertId, null, question_key, obj.nota ?? null, obj.comentario ?? null]);
    });

    if (respostaRows.length > 0) {
      const placeholdersRows = respostaRows.map(() => '(?, ?, ?, ?, ?)').join(', ');
      const flatValues: any[] = [];
      respostaRows.forEach(r => flatValues.push(...r));
      const respQuery = `INSERT INTO AvaliacaoRespostas (avaliacao_id, question_id, question_key, nota, comentario) VALUES ${placeholdersRows}`;
      await pool.query(respQuery, flatValues);
    }
  } catch (e) {
    console.error('Erro ao inserir AvaliacaoRespostas:', e);
    // do not fail the whole transaction; evaluation was saved. Consider retry background job.
  }

  return { id: insertId };
};

export const getEvaluationDetails = async (evaluationId: number, userId: number) => {
  const [evaluationRows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM Avaliacoes WHERE id = ? AND usuario_id = ?',
    [evaluationId, userId]
  );
  if (evaluationRows.length === 0) {
    throw new Error('Avaliação não encontrada ou não pertence a este usuário.');
  }
  const evaluation = evaluationRows[0];

  const [answerRows] = await pool.query<RowDataPacket[]>(
    'SELECT question_key, nota, comentario FROM AvaliacaoRespostas WHERE avaliacao_id = ?',
    [evaluationId]
  );

  const respostas = answerRows.map(row => ({
    questaoTexto: row.question_key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()), // Capitalize words
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
};

export const getUserEvaluationStatus = async (userId: number) => {
  const [lastEvaluation] = await pool.query<RowDataPacket[]>(
    'SELECT criado_em FROM Avaliacoes WHERE usuario_id = ? ORDER BY criado_em DESC LIMIT 1',
    [userId]
  );

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
};