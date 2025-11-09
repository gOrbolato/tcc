import { Request, Response } from 'express';
import * as institutionCourseService from '../services/institutionCourseService';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

export const getInstitutions = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const institutions = await institutionCourseService.getAllInstitutions(q as string | undefined);
    res.status(200).json(institutions);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar instituições.', error: error.message });
  }
};

export const getCourses = async (req: Request, res: Response) => {
  try {
    const { institutionId, q } = req.query;
    const courses = await institutionCourseService.getCoursesByInstitution(Number(institutionId) || undefined, q as string | undefined);
    res.status(200).json(courses);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar cursos.', error: error.message });
  }
};

// Dummy implementations for the missing functions

export const createInstitution = async (req: Request, res: Response) => {
  try {
    const { nome, latitude, longitude } = req.body as any;
    if (!nome) return res.status(400).json({ message: 'Nome da instituição é obrigatório.' });
    const nomeNorm = String(nome).trim().replace(/\s+/g, ' ');
    // Avoid duplicates (case-insensitive)
    const [exists] = await pool.query<RowDataPacket[]>('SELECT id FROM Instituicoes WHERE LOWER(nome) = ?', [nomeNorm.toLowerCase()]);
    if (exists.length > 0) return res.status(409).json({ message: 'Instituição já existe.' });
    const [result] = await pool.query<any>('INSERT INTO Instituicoes (nome, latitude, longitude, is_active) VALUES (?, ?, ?, TRUE)', [nomeNorm, latitude || null, longitude || null]);
    const insertId = result.insertId;
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, nome, latitude, longitude FROM Instituicoes WHERE id = ?', [insertId]);
    res.status(201).json(rows[0]);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInstitution = async (req: Request, res: Response) => {
  try {
    const institutionId = Number(req.params.id);
    const { nome } = req.body;
    const updatedInstitution = await institutionCourseService.updateInstitution(institutionId, nome);
    res.status(200).json({ message: 'Instituição atualizada com sucesso!', institution: updatedInstitution });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteInstitution = async (req: Request, res: Response) => {
  try {
    const institutionId = Number(req.params.id);
    await institutionCourseService.deleteInstitution(institutionId);
    res.status(200).json({ message: 'Instituição desativada com sucesso!' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { nome, instituicao_id } = req.body as any;
    if (!nome || !instituicao_id) return res.status(400).json({ message: 'Nome do curso e instituicao_id são obrigatórios.' });
    const nomeNorm = String(nome).trim().replace(/\s+/g, ' ');
    const [exists] = await pool.query<RowDataPacket[]>('SELECT id FROM Cursos WHERE LOWER(nome) = ? AND instituicao_id = ?', [nomeNorm.toLowerCase(), instituicao_id]);
    if (exists.length > 0) return res.status(409).json({ message: 'Curso já existe para essa instituição.' });
    const [result] = await pool.query<any>('INSERT INTO Cursos (nome, instituicao_id, is_active) VALUES (?, ?, TRUE)', [nomeNorm, instituicao_id]);
    const insertId = result.insertId;
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, nome, instituicao_id FROM Cursos WHERE id = ?', [insertId]);
    res.status(201).json(rows[0]);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const courseId = Number(req.params.id);
    const { nome } = req.body;
    const updatedCourse = await institutionCourseService.updateCourse(courseId, nome);
    res.status(200).json({ message: 'Curso atualizado com sucesso!', course: updatedCourse });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const courseId = Number(req.params.id);
    await institutionCourseService.deleteCourse(courseId);
    res.status(200).json({ message: 'Curso desativado com sucesso!' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getCoursesByInstitution = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const courses = await institutionCourseService.getCoursesByInstitution(Number(id));
    res.status(200).json(courses);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar cursos da instituição.', error: error.message });
  }
};

export const getInstitutionsNearby = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius } = req.query;
    if (!latitude || !longitude || !radius) {
      return res.status(400).json({ message: 'Latitude, longitude e raio são obrigatórios.' });
    }
    const nearbyInstitutions = await institutionCourseService.getInstitutionsNearby(Number(latitude), Number(longitude), Number(radius));
    res.status(200).json(nearbyInstitutions);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar instituições próximas.', error: error.message });
  }
};
