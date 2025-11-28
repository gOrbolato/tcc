// Importa os tipos Request e Response do Express para lidar com as requisições e respostas HTTP.
import { Request, Response } from 'express';
// Importa o serviço de análise para interagir com a lógica de negócio.
import * as analysisService from '../services/analysisService';

/**
 * @function getInstitutionAnalysis
 * @description Gera uma análise para uma instituição com base em períodos e um curso opcional.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const getInstitutionAnalysis = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Extrai o ID da instituição dos parâmetros da rota.
    const { id } = req.params;
    // Extrai os filtros de data e curso da query string.
    const {
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
      courseId,
    } = req.query;

    // Valida se o ID da instituição foi fornecido.
    if (!id) {
      return res.status(400).json({ message: 'O ID da instituição é obrigatório.' });
    }

    // Monta um objeto de opções para a análise.
    const options = {
      currentStart: currentStart as string | undefined,
      currentEnd: currentEnd as string | undefined,
      previousStart: previousStart as string | undefined,
      previousEnd: previousEnd as string | undefined,
      courseId: courseId as string | undefined,
    };
    // Chama o serviço para gerar a análise da instituição.
    const analysisResult = await analysisService.generateAnalysisForInstitution(Number(id), options);
    // Retorna o resultado da análise com status 200.
    return res.status(200).json(analysisResult);

  } catch (error: any) {
    // Em caso de erro, loga a falha e retorna uma resposta de erro 500.
    console.error('Erro no controller de análise:', error);
    return res.status(500).json({ message: 'Erro ao gerar a análise.', error: error.message });
  }
};

/**
 * @function downloadReportPdf
 * @description Gera e baixa um relatório de análise em PDF para uma instituição.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response | void>}
 */
export const downloadReportPdf = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // Extrai o ID da instituição dos parâmetros da rota.
    const { id } = req.params;
    // Extrai os filtros de data da query string.
    const { 
      currentStart, 
      currentEnd, 
      previousStart, 
      previousEnd 
    } = req.query;

    // Valida se o ID da instituição foi fornecido.
    if (!id) {
      return res.status(400).json({ message: 'O ID da instituição é obrigatório.' });
    }

    // Monta um objeto de opções para o relatório.
    const options = {
      currentStart: currentStart as string | undefined,
      currentEnd: currentEnd as string | undefined,
      previousStart: previousStart as string | undefined,
      previousEnd: previousEnd as string | undefined,
    };

    // Chama o serviço para gerar o relatório em PDF.
    const pdfBuffer = await analysisService.generatePdfReport(Number(id), options);

    // Define os cabeçalhos da resposta para indicar que é um arquivo PDF para download.
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio_avaliacao.pdf"');
    // Envia o buffer do PDF como resposta.
    res.send(pdfBuffer);

  } catch (error: any) {
    // Em caso de erro, loga a falha e retorna uma resposta de erro 500.
    console.error('Erro ao gerar PDF no controller:', error);
    res.status(500).json({ message: 'Erro ao gerar o PDF do relatório.', error: error.message });
  }
};
