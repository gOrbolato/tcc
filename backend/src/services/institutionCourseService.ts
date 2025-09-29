import pool from '../config/database';
import { OkPacket, RowDataPacket } from 'mysql2';

// Instituições
export const createInstitution = async (nome: string) => {
  const [existing] = await pool.query<RowDataPacket[]>('SELECT * FROM Instituicoes WHERE nome = ?', [nome]);
  if (existing.length > 0) {
    throw new Error('Instituição já cadastrada.');
  }
  const [result] = await pool.query<OkPacket>('INSERT INTO Instituicoes (nome) VALUES (?)', [nome]);
  return { id: result.insertId, nome };
};

export const getInstitutions = async () => {
  const [institutions] = await pool.query<RowDataPacket[]>('SELECT id, nome FROM Instituicoes');
  return institutions;
};

export const updateInstitution = async (id: number, nome: string) => {
  const [result] = await pool.query<OkPacket>('UPDATE Instituicoes SET nome = ? WHERE id = ?', [nome, id]);
  if (result.affectedRows === 0) {
    throw new Error('Instituição não encontrada.');
  }
  return { id, nome };
};

export const deleteInstitution = async (id: number) => {
  const [result] = await pool.query<OkPacket>('DELETE FROM Instituicoes WHERE id = ?', [id]);
  if (result.affectedRows === 0) {
    throw new Error('Instituição não encontrada.');
  }
};

// Cursos
export const createCourse = async (nome: string, instituicao_id: number) => {
  const [existing] = await pool.query<RowDataPacket[]>('SELECT * FROM Cursos WHERE nome = ? AND instituicao_id = ?', [nome, instituicao_id]);
  if (existing.length > 0) {
    throw new Error('Curso já cadastrado para esta instituição.');
  }
  const [result] = await pool.query<OkPacket>('INSERT INTO Cursos (nome, instituicao_id) VALUES (?, ?)', [nome, instituicao_id]);
  return { id: result.insertId, nome, instituicao_id };
};

export const getCourses = async () => {
  const [courses] = await pool.query<RowDataPacket[]>('SELECT c.id, c.nome, i.nome as instituicao_nome FROM Cursos c JOIN Instituicoes i ON c.instituicao_id = i.id');
  return courses;
};

export const updateCourse = async (id: number, nome: string, instituicao_id: number) => {
  const [result] = await pool.query<OkPacket>('UPDATE Cursos SET nome = ?, instituicao_id = ? WHERE id = ?', [nome, instituicao_id, id]);
  if (result.affectedRows === 0) {
    throw new Error('Curso não encontrado.');
  }
  return { id, nome, instituicao_id };
};

export const deleteCourse = async (id: number) => {
  const [result] = await pool.query<OkPacket>('DELETE FROM Cursos WHERE id = ?', [id]);
  if (result.affectedRows === 0) {
    throw new Error('Curso não encontrado.');
  }
};
