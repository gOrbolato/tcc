import { Response } from 'express';
import * as evaluationService from '../services/evaluationService';

// Adicionando uma interface para estender o Request do Express
import { Request as ExpressRequest } from 'express';
interface AuthRequest extends ExpressRequest {
  user?: any;
}

export const submitEvaluation = async (req: AuthRequest, res: Response) => {
  try {
    const evaluation = await evaluationService.submitEvaluation(req.user.id, req.body);
    res.status(201).json({ message: 'Avaliação enviada com sucesso!', evaluation });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getEvaluations = async (req: AuthRequest, res: Response) => {
  try {
    const evaluations = await evaluationService.getEvaluations(req.user.id);
    res.status(200).json(evaluations);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
