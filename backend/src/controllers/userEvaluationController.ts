
import { Request, Response } from 'express';
import * as userEvaluationService from '../services/userEvaluationService';

interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

export const submitEvaluation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autorizado.' });
    }

    const evaluationData = { userId: req.user.id, ...req.body };
    const result = await userEvaluationService.submitEvaluation(evaluationData);
    res.status(201).json({ message: 'Avaliação enviada com sucesso!', evaluationId: result.id });

  } catch (error: any) {
    console.error("--- ERRO AO SUBMETER AVALIAÇÃO ---", error);
    res.status(400).json({ message: error.message });
  }
};

export const getEvaluationDetailsById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Não autorizado.' });

    const evaluationId = Number(req.params.id);
    const userId = req.user.id;

    const details = await userEvaluationService.getEvaluationDetails(evaluationId, userId);
    res.status(200).json(details);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
