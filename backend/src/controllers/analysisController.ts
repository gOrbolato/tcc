import { Request, Response } from 'express';
import * as analysisService from '../services/analysisService';

export const getInstitutionAnalysis = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      currentStart, 
      currentEnd, 
      previousStart, 
      previousEnd 
    } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'O ID da instituição é obrigatório.' });
    }

    const options = {
      currentStart: currentStart as string | undefined,
      currentEnd: currentEnd as string | undefined,
      previousStart: previousStart as string | undefined,
      previousEnd: previousEnd as string | undefined,
    };

    const analysisResult = await analysisService.generateAnalysisForInstitution(Number(id), options);
    res.status(200).json(analysisResult);

  } catch (error: any) {
    console.error('Erro no controller de análise:', error);
    res.status(500).json({ message: 'Erro ao gerar a análise.', error: error.message });
  }
};

export const downloadReportPdf = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      currentStart, 
      currentEnd, 
      previousStart, 
      previousEnd 
    } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'O ID da instituição é obrigatório.' });
    }

    const options = {
      currentStart: currentStart as string | undefined,
      currentEnd: currentEnd as string | undefined,
      previousStart: previousStart as string | undefined,
      previousEnd: previousEnd as string | undefined,
    };

    const pdfBuffer = await analysisService.generatePdfReport(Number(id), options);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio_avaliacao.pdf"');
    res.send(pdfBuffer);

  } catch (error: any) {
    console.error('Erro ao gerar PDF no controller:', error);
    res.status(500).json({ message: 'Erro ao gerar o PDF do relatório.', error: error.message });
  }
};

