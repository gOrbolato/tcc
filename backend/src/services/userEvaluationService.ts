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
  const grades = Object.entries(answers).filter(([key]) => key.startsWith('nota_')).map(([, value]) => value as number);
  const media_final = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;

  const columns = ['usuario_id', 'instituicao_id', 'curso_id', 'media_final', ...Object.keys(answers)];
  const placeholders = columns.map(() => '?').join(', ');
  const values = [userId, instituicao_id, curso_id, media_final, ...Object.values(answers)];

  // Log para depuração
  console.log('--- DEBUG: Valores sendo inseridos na tabela Avaliacoes: ---', values);

  const query = `INSERT INTO Avaliacoes (${columns.join(', ')}) VALUES (${placeholders});`;

  const [result] = await pool.query<OkPacket>(query, values);
  return { id: result.insertId };
};

export const getEvaluationDetails = async (evaluationId: number, userId: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM Avaliacoes WHERE id = ? AND usuario_id = ?',
    [evaluationId, userId]
  );
  if (rows.length === 0) {
    throw new Error('Avaliação não encontrada ou não pertence a este usuário.');
  }
  return rows[0];
};