
import { Request, Response } from 'express';
import * as institutionCourseService from '../services/institutionCourseService';

// Para o registro de usuário (lógica de obter ou criar)
export const createInstitution = async (req: Request, res: Response) => {
  try {
    const institution = await institutionCourseService.findOrCreateInstitution(req.body.nome);
    res.status(201).json(institution);
  } catch (error: any) { res.status(400).json({ message: error.message }); }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const course = await institutionCourseService.findOrCreateCourse(req.body.nome, req.body.instituicao_id);
    res.status(201).json(course);
  } catch (error: any) { res.status(400).json({ message: error.message }); }
};

// Para gerenciamento (leitura, atualização, deleção)
export const getInstitutions = async (req: Request, res: Response) => {
  try {
    const institutions = await institutionCourseService.getInstitutions();
    res.status(200).json(institutions);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const getCourses = async (req: Request, res: Response) => {
  try {
    const courses = await institutionCourseService.getCourses();
    res.status(200).json(courses);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const getCoursesByInstitution = async (req: Request, res: Response) => {
  try {
    const courses = await institutionCourseService.getCoursesByInstitutionId(Number(req.params.id));
    res.status(200).json(courses);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const updateInstitution = async (req: Request, res: Response) => {
  try {
    const institution = await institutionCourseService.updateInstitution(Number(req.params.id), req.body.nome);
    res.status(200).json({ message: 'Instituição atualizada com sucesso!', institution });
  } catch (error: any) { res.status(400).json({ message: error.message }); }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const course = await institutionCourseService.updateCourse(Number(req.params.id), req.body.nome);
    res.status(200).json({ message: 'Curso atualizado com sucesso!', course });
  } catch (error: any) { res.status(400).json({ message: error.message }); }
};

export const deleteInstitution = async (req: Request, res: Response) => {
  try {
    await institutionCourseService.deleteInstitution(Number(req.params.id));
    res.status(200).json({ message: 'Instituição excluída com sucesso!' });
  } catch (error: any) { res.status(400).json({ message: error.message }); }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    await institutionCourseService.deleteCourse(Number(req.params.id));
    res.status(200).json({ message: 'Curso excluído com sucesso!' });
  } catch (error: any) { res.status(400).json({ message: error.message }); }
};
