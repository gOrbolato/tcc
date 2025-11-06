
import { Request, Response } from 'express';
import * as evaluationService from '../services/evaluationService';
import * as userEvaluationService from '../services/userEvaluationService';
import * as userService from '../services/userService';

interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

export const getEvaluations = async (req: Request, res: Response) => {
  try {
    // Os filtros virão da query string da URL
    const filters = {
      institutionId: req.query.institutionId as string | undefined,
      courseId: req.query.courseId as string | undefined,
      latitude: req.query.lat as string | undefined,
      longitude: req.query.lon as string | undefined,
      radius: req.query.radius as string | undefined,
      anonymizedId: req.query.anonymizedId as string | undefined,
    };

    const evaluations = await evaluationService.getFilteredEvaluations(filters);
    res.status(200).json(evaluations);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar avaliações.', error: error.message });
  }
};

export const getMyEvaluations = async (req: AuthenticatedRequest, res: Response) => {
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

export const getTemplate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autorizado.' });
    }

    const user = await userService.getUserById(req.user.id);

    // Simple, hard-coded template for the evaluation form. In future this should come from DB.
    const template = {
      professor: null,
      instituicao_id: user.instituicao_id,
      curso_id: user.curso_id,
      questoes: [
        // Instituição (101-108)
        { id: 101, texto: 'Infraestrutura geral (salas, cantina ou refeitório, etc.)', tipo: 'ESCOLHA_UNICA' },
        { id: 102, texto: 'Qualidade e modernização dos laboratórios', tipo: 'ESCOLHA_UNICA' },
        { id: 103, texto: 'Estrutura e acervo da biblioteca', tipo: 'ESCOLHA_UNICA' },
        { id: 104, texto: 'Suporte para mercado de trabalho (auxílio com estágio)', tipo: 'ESCOLHA_UNICA' },
        { id: 105, texto: 'Localização e facilidade de acesso', tipo: 'ESCOLHA_UNICA' },
        { id: 106, texto: 'Acessibilidade para pessoas com deficiência', tipo: 'ESCOLHA_UNICA' },
        { id: 107, texto: 'Acessibilidade e prestatividade da direção', tipo: 'ESCOLHA_UNICA' },
        { id: 108, texto: 'Acessibilidade e prestatividade da coordenação', tipo: 'ESCOLHA_UNICA' },
        // Curso (109-112)
        { id: 109, texto: 'Didática e clareza dos professores', tipo: 'ESCOLHA_UNICA' },
        { id: 110, texto: 'Dinamismo dos professores nas explicações da matéria', tipo: 'ESCOLHA_UNICA' },
        { id: 111, texto: 'Disponibilidade dos professores para dúvidas', tipo: 'ESCOLHA_UNICA' },
        { id: 112, texto: 'Relevância e atualização de conteúdo das matérias', tipo: 'ESCOLHA_UNICA' },
      ],
    };
    res.status(200).json(template);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao obter template de avaliação.', error: error.message });
  }
};

export const getUserAvailable = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Placeholder: backend currently doesn't have "available" logic. Return empty list for now.
    res.status(200).json([]);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao obter avaliações disponíveis.', error: error.message });
  }
};

export const getUserCompleted = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Usuário não autenticado.' });
    const evaluations = await evaluationService.getEvaluationsByUserId(req.user.id);
    res.status(200).json(evaluations);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao obter avaliações concluídas.', error: error.message });
  }
};

export const getEvaluationStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autorizado.' });
    }
    const status = await userEvaluationService.getUserEvaluationStatus(req.user.id);
    res.status(200).json(status);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
