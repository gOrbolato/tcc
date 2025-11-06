import { Request, Response } from 'express';
import * as institutionCourseService from '../services/institutionCourseService';

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

export const createInstitution = async (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Not Implemented' });
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

export const createCourse = async (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Not Implemented' });
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

export const getCoursesByInstitution = async (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Not Implemented' });
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
