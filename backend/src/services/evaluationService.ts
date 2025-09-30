import pool from '../config/database';
import { OkPacket, RowDataPacket } from 'mysql2';

export const submitEvaluation = async (userId: number, evaluationData: any) => {
  const {
    instituicao_id,
    curso_id,
    nota_infraestrutura,
    obs_infraestrutura,
    nota_material_didatico,
    obs_material_didatico,
  } = evaluationData;

  const media_final = (nota_infraestrutura + nota_material_didatico) / 2;

  const [result] = await pool.query<OkPacket>(
    'INSERT INTO Avaliacoes (usuario_id, instituicao_id, curso_id, nota_infraestrutura, obs_infraestrutura, nota_material_didatico, obs_material_didatico, media_final) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      userId,
      instituicao_id,
      curso_id,
      nota_infraestrutura,
      obs_infraestrutura,
      nota_material_didatico,
      obs_material_didatico,
      media_final,
    ]
  );

  return { id: result.insertId, ...evaluationData, media_final };
};

export const getEvaluations = async (userId: number) => {
  const [evaluations] = await pool.query<RowDataPacket[]>(
    `SELECT
        a.id,
        a.nota_infraestrutura,
        a.obs_infraestrutura,
        a.nota_material_didatico,
        a.obs_material_didatico,
        a.media_final,
        a.criado_em,
        i.nome AS instituicao_nome,
        c.nome AS curso_nome
    FROM Avaliacoes a
    JOIN Instituicoes i ON a.instituicao_id = i.id
    JOIN Cursos c ON a.curso_id = c.id
    WHERE a.usuario_id = ?
    ORDER BY a.criado_em DESC`,
    [userId]
  );
  return evaluations;
};