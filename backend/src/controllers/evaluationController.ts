
import { Request, Response } from 'express';
import * as evaluationService from '../services/evaluationService';

export const getEvaluations = async (req: Request, res: Response) => {
  try {
    // Os filtros virão da query string da URL
    const filters = {
      institutionId: req.query.institutionId as string | undefined,
      courseId: req.query.courseId as string | undefined,
      latitude: req.query.lat as string | undefined,
      longitude: req.query.lon as string | undefined,
      radius: req.query.radius as string | undefined,
    };

    const evaluations = await evaluationService.getFilteredEvaluations(filters);
    res.status(200).json(evaluations);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar avaliações.', error: error.message });
  }
};

export const getMyEvaluations = async (req: any, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const evaluations = await evaluationService.getEvaluationsByUserId(req.user.id);
    res.status(200).json(evaluations);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar suas avaliações.', error: error.message });
  }
};
