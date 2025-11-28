// Importa a pool de conexões do banco de dados.
import pool from '../config/database';
// Importa o tipo RowDataPacket do mysql2 para tipar os resultados das queries.
import { RowDataPacket } from 'mysql2';

// Interface para os filtros de busca de avaliações.
interface EvaluationFilters {
  institutionId?: string;
  courseId?: string;
  latitude?: string;
  longitude?: string;
  radius?: string;
  anonymizedId?: string;
}

/**
 * @function getFilteredEvaluations
 * @description Busca e retorna uma lista de avaliações com base em filtros, para o painel de administrador.
 * @param {EvaluationFilters} filters - Os filtros para a busca de avaliações.
 * @returns {Promise<RowDataPacket[]>} - Uma promessa que resolve para um array de avaliações.
 */
export const getFilteredEvaluations = async (filters: EvaluationFilters): Promise<RowDataPacket[]> => {
  // A query base seleciona os dados da avaliação e os nomes da instituição/curso e o RA/ID anônimo do usuário.
  // Inclui um cálculo de distância opcional se a latitude e longitude forem fornecidas.
  let query = `
    SELECT 
      a.id, a.media_final, a.criado_em, 
      i.nome AS instituicao_nome, 
      c.nome AS curso_nome,
      u.ra AS usuario_ra,
      u.anonymized_id
      ${filters.latitude && filters.longitude ? ", ( 6371 * acos( cos( radians(?) ) * cos( radians( i.latitude ) ) * cos( radians( i.longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( i.latitude ) ) ) ) AS distance" : ""}
    FROM Avaliacoes a
    JOIN Instituicoes i ON a.instituicao_id = i.id
    JOIN Cursos c ON a.curso_id = c.id
    JOIN Usuarios u ON a.usuario_id = u.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (filters.latitude && filters.longitude) {
    params.push(Number(filters.latitude), Number(filters.longitude), Number(filters.latitude));
  }
  if (filters.institutionId) { query += ' AND a.instituicao_id = ?'; params.push(filters.institutionId); }
  if (filters.courseId) { query += ' AND a.curso_id = ?'; params.push(filters.courseId); }
  if (filters.anonymizedId) { query += ' AND u.anonymized_id = ?'; params.push(filters.anonymizedId); }
  // A cláusula HAVING é usada para filtrar pela distância calculada.
  if (filters.latitude && filters.longitude && filters.radius) { query += ' HAVING distance < ?'; params.push(Number(filters.radius)); }

  query += ' ORDER BY a.criado_em DESC';

  const [evaluations] = await pool.query<RowDataPacket[]>(query, params);
  return evaluations;
};

/**
 * @function getEvaluationsByUserId
 * @description Busca e retorna todas as avaliações feitas por um usuário específico.
 * @param {number} userId - O ID do usuário.
 * @returns {Promise<RowDataPacket[]>} - Uma promessa que resolve para um array de avaliações do usuário.
 */
export const getEvaluationsByUserId = async (userId: number): Promise<RowDataPacket[]> => {
  const query = `
    SELECT 
      a.id, a.media_final, a.criado_em, 
      i.nome AS instituicao_nome, 
      c.nome AS curso_nome
    FROM Avaliacoes a 
    LEFT JOIN Instituicoes i ON a.instituicao_id = i.id 
    LEFT JOIN Cursos c ON a.curso_id = c.id 
    WHERE a.usuario_id = ? 
    ORDER BY a.criado_em DESC`;

  const [evaluations] = await pool.query<RowDataPacket[]>(query, [userId]);
  return evaluations;
};