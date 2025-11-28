// Importa os tipos Request e Response do Express para lidar com as requisições e respostas HTTP.
import { Request, Response } from 'express';
// Importa o serviço de avaliação do usuário para interagir com a lógica de negócio.
import * as userEvaluationService from '../services/userEvaluationService';

// Define uma interface para requisições autenticadas, que podem conter informações do usuário.
interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

/**
 * @function submitEvaluation
 * @description Submete uma nova avaliação de um usuário.
 * @param {AuthenticatedRequest} req - O objeto de requisição autenticada do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const submitEvaluation = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    // Verifica se o usuário está autenticado.
    if (!req.user) {
      return res.status(401).json({ message: 'Não autorizado.' });
    }

    // Combina o ID do usuário com os dados da avaliação do corpo da requisição.
    const evaluationData = { userId: req.user.id, ...req.body };
    // Chama o serviço para submeter a avaliação.
    const result = await userEvaluationService.submitEvaluation(evaluationData);
    // Retorna uma mensagem de sucesso com o ID da avaliação criada.
    return res.status(201).json({ message: 'Avaliação enviada com sucesso!', evaluationId: result.id });

  } catch (error: any) {
    console.error("--- ERRO AO SUBMETER AVALIAÇÃO ---", error);
    // Em caso de erro, retorna uma resposta de erro 400.
    return res.status(400).json({ message: error.message });
  }
};

/**
 * @function getEvaluationDetailsById
 * @description Busca e retorna os detalhes de uma avaliação específica.
 * @param {AuthenticatedRequest} req - O objeto de requisição autenticada do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const getEvaluationDetailsById = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    // Verifica se o usuário está autenticado.
    if (!req.user) return res.status(401).json({ message: 'Não autorizado.' });

    const evaluationId = Number(req.params.id);
    const userId = req.user.id;

    // Chama o serviço para obter os detalhes da avaliação.
    const details = await userEvaluationService.getEvaluationDetails(evaluationId, userId);
    // Retorna os detalhes da avaliação.
    return res.status(200).json(details);
  } catch (error: any) {
    // Em caso de erro, retorna uma resposta de erro 400.
    return res.status(400).json({ message: error.message });
  }
};
