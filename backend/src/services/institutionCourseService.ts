import pool from '../config/database';
import { OkPacket, RowDataPacket } from 'mysql2';

// --- LÓGICA DE "OBTER OU CRIAR" ---
export const findOrCreateInstitution = async (nome: string) => {
  if (!nome || nome.trim() === '') throw new Error('O nome da instituição não pode ser vazio.');
  const [existing] = await pool.query<RowDataPacket[]>('SELECT * FROM Instituicoes WHERE nome = ?', [nome.trim()]);
  if (existing.length > 0) return existing[0];
  const [result] = await pool.query<OkPacket>('INSERT INTO Instituicoes (nome) VALUES (?)', [nome.trim()]);
  return { id: result.insertId, nome: nome.trim() };
};

export const findOrCreateCourse = async (nome: string, instituicao_id: number) => {
  if (!nome || nome.trim() === '') throw new Error('O nome do curso não pode ser vazio.');
  const [existing] = await pool.query<RowDataPacket[]>('SELECT * FROM Cursos WHERE nome = ? AND instituicao_id = ?', [nome.trim(), instituicao_id]);
  if (existing.length > 0) return existing[0];
  const [result] = await pool.query<OkPacket>('INSERT INTO Cursos (nome, instituicao_id) VALUES (?, ?)', [nome.trim(), instituicao_id]);
  return { id: result.insertId, nome: nome.trim(), instituicao_id };
};

// --- FUNÇÕES DE LEITURA ---
export const getInstitutions = async (nameFilter?: string) => {
  let query = `
    SELECT i.id, i.nome, AVG(a.media_final) AS nota_geral
    FROM Instituicoes i
    LEFT JOIN Avaliacoes a ON i.id = a.instituicao_id
  `;
  const params: (string | number)[] = [];

  if (nameFilter) {
    query += ` WHERE i.nome LIKE ?`;
    params.push(`%${nameFilter}%`);
  }

  query += `
    GROUP BY i.id, i.nome
    ORDER BY i.nome ASC;
  `;
  const [institutions] = await pool.query<RowDataPacket[]>(query, params);
  return institutions;
};

export const getCourses = async () => {
  const [courses] = await pool.query<RowDataPacket[]>('SELECT c.id, c.nome, c.instituicao_id, i.nome as instituicao_nome FROM Cursos c JOIN Instituicoes i ON c.instituicao_id = i.id ORDER BY c.nome ASC');
  return courses;
};

export const getCoursesByInstitutionId = async (id: number) => {
  const query = `
    SELECT c.id, c.nome, AVG(a.media_final) AS nota_geral
    FROM Cursos c
    LEFT JOIN Avaliacoes a ON c.id = a.curso_id
    WHERE c.instituicao_id = ?
    GROUP BY c.id, c.nome
    ORDER BY c.nome ASC;
  `;
  const [courses] = await pool.query<RowDataPacket[]>(query, [id]);
  return courses;
};

// --- FUNÇÕES DE MODIFICAÇÃO ---
export const updateInstitution = async (id: number, nome: string) => {
  const [result] = await pool.query<OkPacket>('UPDATE Instituicoes SET nome = ? WHERE id = ?', [nome, id]);
  if (result.affectedRows === 0) throw new Error('Instituição não encontrada.');
  return { id, nome };
};

export const updateCourse = async (id: number, nome: string) => {
  const [result] = await pool.query<OkPacket>('UPDATE Cursos SET nome = ? WHERE id = ?', [nome, id]);
  if (result.affectedRows === 0) throw new Error('Curso não encontrado.');
  return { id, nome };
};

export const deleteInstitution = async (id: number) => {
  const [courses] = await pool.query<RowDataPacket[]>('SELECT id FROM Cursos WHERE instituicao_id = ?', [id]);
  if (courses.length > 0) throw new Error('Não é possível excluir uma instituição que ainda possui cursos vinculados.');
  const [result] = await pool.query<OkPacket>('DELETE FROM Instituicoes WHERE id = ?', [id]);
  if (result.affectedRows === 0) throw new Error('Instituição não encontrada.');
};

export const deleteCourse = async (id: number) => {
  const [result] = await pool.query<OkPacket>('DELETE FROM Cursos WHERE id = ?', [id]);
  if (result.affectedRows === 0) throw new Error('Curso não encontrado.');
};