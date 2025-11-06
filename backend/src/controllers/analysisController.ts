import { Request, Response } from 'express';
import * as analysisService from '../services/analysisService';

export const getInstitutionAnalysis = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'O ID da instituição é obrigatório.' });
    }

    const analysisResult = await analysisService.generateAnalysisForInstitution(Number(id));
    res.status(200).json(analysisResult);

  } catch (error: any) {
    console.error('Erro no controller de análise:', error);
    res.status(500).json({ message: 'Erro ao gerar a análise.', error: error.message });
  }
};
