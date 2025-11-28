// Importa os tipos Request e Response do Express para lidar com as requisições e respostas HTTP.
import { Request, Response } from 'express';
// Importa o serviço de avaliação para interagir com a lógica de negócio.
import * as evaluationService from '../services/evaluationService';
// Importa o serviço de avaliação do usuário.
import * as userEvaluationService from '../services/userEvaluationService';
// Importa o serviço de usuário.
import * as userService from '../services/userService';

// Define uma interface para requisições autenticadas, que podem conter informações do usuário.
interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

/**
 * @function getEvaluations
 * @description Busca e retorna uma lista de avaliações com base em filtros.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const getEvaluations = async (req: Request, res: Response): Promise<void> => {
  try {
    // Coleta filtros da query string da requisição.
    const filters = {
      institutionId: req.query.institutionId as string | undefined,
      courseId: req.query.courseId as string | undefined,
      latitude: req.query.lat as string | undefined,
      longitude: req.query.lon as string | undefined,
      radius: req.query.radius as string | undefined,
      anonymizedId: req.query.anonymizedId as string | undefined,
    };

    // Chama o serviço para buscar as avaliações filtradas.
    const evaluations = await evaluationService.getFilteredEvaluations(filters);
    // Retorna a lista de avaliações.
    res.status(200).json(evaluations);
  } catch (error: any) {
    // Em caso de erro, retorna uma resposta de erro 500.
    res.status(500).json({ message: 'Erro ao buscar avaliações.', error: error.message });
  }
};

/**
 * @function getMyEvaluations
 * @description Busca e retorna as avaliações do usuário autenticado.
 * @param {AuthenticatedRequest} req - O objeto de requisição autenticada do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const getMyEvaluations = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    // Verifica se o usuário está autenticado.
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    // Chama o serviço para buscar as avaliações pelo ID do usuário.
    const evaluations = await evaluationService.getEvaluationsByUserId(req.user.id);
    // Retorna a lista de avaliações.
    return res.status(200).json(evaluations);
  } catch (error: any) {
    // Em caso de erro, retorna uma resposta de erro 500.
    return res.status(500).json({ message: 'Erro ao buscar suas avaliações.', error: error.message });
  }
};

/**
 * @function getTemplate
 * @description Retorna um modelo de formulário de avaliação.
 * @param {AuthenticatedRequest} req - O objeto de requisição autenticada do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const getTemplate = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    // Verifica se o usuário está autenticado.
    if (!req.user) {
      return res.status(401).json({ message: 'Não autorizado.' });
    }

    // Busca os dados do usuário para pré-popular o template.
    const user = await userService.getUserById(req.user.id);

    // Template fixo para o formulário de avaliação.
    const template = {
      professor: null,
      instituicao_id: user.instituicao_id,
      curso_id: user.curso_id,
      questoes: [
        // Questões sobre a Instituição
        { id: 101, texto: 'Infraestrutura geral (salas, cantina ou refeitório, etc.)', tipo: 'ESCOLHA_UNICA' },
        { id: 102, texto: 'Qualidade e modernização dos laboratórios', tipo: 'ESCOLHA_UNICA' },
        { id: 103, texto: 'Estrutura e acervo da biblioteca', tipo: 'ESCOLHA_UNICA' },
        { id: 104, texto: 'Suporte para mercado de trabalho (auxílio com estágio)', tipo: 'ESCOLHA_UNICA' },
        { id: 105, texto: 'Localização e facilidade de acesso', tipo: 'ESCOLHA_UNICA' },
        { id: 106, texto: 'Acessibilidade para pessoas com deficiência', tipo: 'ESCOLHA_UNICA' },
        { id: 107, texto: 'Acessibilidade e prestatividade da direção', tipo: 'ESCOLHA_UNICA' },
        { id: 108, texto: 'Acessibilidade e prestatividade da coordenação', tipo: 'ESCOLHA_UNICA' },
        // Questões sobre o Curso
        { id: 109, texto: 'Didática e clareza dos professores', tipo: 'ESCOLHA_UNICA' },
        { id: 110, texto: 'Dinamismo dos professores nas explicações da matéria', tipo: 'ESCOLHA_UNICA' },
        { id: 111, texto: 'Disponibilidade dos professores para dúvidas', tipo: 'ESCOLHA_UNICA' },
        { id: 112, texto: 'Relevância e atualização de conteúdo das matérias', tipo: 'ESCOLHA_UNICA' },
      ],
    };
    // Retorna o modelo de avaliação.
    return res.status(200).json(template);
  } catch (error: any) {
    // Em caso de erro, retorna uma resposta de erro 500.
    return res.status(500).json({ message: 'Erro ao obter template de avaliação.', error: error.message });
  }
};

/**
 * @function getUserAvailable
 * @description Retorna uma lista de avaliações disponíveis para o usuário (atualmente um placeholder).
 * @param {AuthenticatedRequest} req - O objeto de requisição autenticada do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const getUserAvailable = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Retorna uma lista vazia, pois a lógica de "disponíveis" não está implementada.
    res.status(200).json([]);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao obter avaliações disponíveis.', error: error.message });
  }
};

/**
 * @function getUserCompleted
 * @description Retorna uma lista de avaliações já concluídas pelo usuário.
 * @param {AuthenticatedRequest} req - O objeto de requisição autenticada do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const getUserCompleted = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    // Verifica se o usuário está autenticado.
    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Usuário não autenticado.' });
    // Chama o serviço para buscar as avaliações concluídas pelo usuário.
    const evaluations = await evaluationService.getEvaluationsByUserId(req.user.id);
    return res.status(200).json(evaluations);
  } catch (error: any) {
    return res.status(500).json({ message: 'Erro ao obter avaliações concluídas.', error: error.message });
  }
};

/**
 * @function getEvaluationStatus
 * @description Retorna o status da avaliação do usuário (se já foi feita ou não).
 * @param {AuthenticatedRequest} req - O objeto de requisição autenticada do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const getEvaluationStatus = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    // Verifica se o usuário está autenticado.
    if (!req.user) {
      return res.status(401).json({ message: 'Não autorizado.' });
    }
    // Chama o serviço para obter o status da avaliação do usuário.
    const status = await userEvaluationService.getUserEvaluationStatus(req.user.id);
    return res.status(200).json(status);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};
