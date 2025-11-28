// Importa os tipos Request e Response do Express para lidar com as requisições e respostas HTTP.
import { Request, Response } from 'express';
// Importa o serviço de desbloqueio para interagir com a lógica de negócio.
import * as desbloqueioService from '../services/desbloqueioService';

/**
 * @function getPendingDesbloqueios
 * @description Busca e retorna as solicitações de desbloqueio pendentes, opcionalmente filtradas por data.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const getPendingDesbloqueios = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.query;
    // Chama o serviço para obter as solicitações de desbloqueio pendentes.
    const requests = await desbloqueioService.getPendingDesbloqueios(date as string | undefined);
    // Retorna as solicitações com status 200.
    res.status(200).json(requests);
  } catch (error: any) {
    // Em caso de erro, retorna uma resposta de erro 500.
    res.status(500).json({ message: 'Erro ao buscar solicitações de desbloqueio.', error: error.message });
  }
};

/**
 * @function getPendingDesbloqueioCount
 * @description Retorna a contagem de solicitações de desbloqueio pendentes.
 * @param {Request} _req - O objeto de requisição do Express (não utilizado).
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const getPendingDesbloqueioCount = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Chama o serviço para obter a contagem de solicitações pendentes.
    const count = await desbloqueioService.getPendingDesbloqueioCount();
    // Retorna a contagem com status 200.
    res.status(200).json({ count });
  } catch (error: any) {
    // Em caso de erro, retorna uma resposta de erro 500.
    res.status(500).json({ message: 'Erro ao buscar contagem de solicitações.', error: error.message });
  }
};

/**
 * @function approveDesbloqueio
 * @description Aprova uma solicitação de desbloqueio.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const approveDesbloqueio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Chama o serviço para aprovar a solicitação de desbloqueio.
    await desbloqueioService.approveDesbloqueio(Number(id));
    // Retorna uma mensagem de sucesso.
    res.status(200).json({ message: 'Solicitação de desbloqueio aprovada com sucesso.' });
  } catch (error: any) {
    // Em caso de erro, retorna uma resposta de erro 400.
    res.status(400).json({ message: error.message });
  }
};

/**
 * @function rejectDesbloqueio
 * @description Rejeita uma solicitação de desbloqueio.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const rejectDesbloqueio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Chama o serviço para rejeitar a solicitação de desbloqueio.
    await desbloqueioService.rejectDesbloqueio(Number(id));
    // Retorna uma mensagem de sucesso.
    res.status(200).json({ message: 'Solicitação de desbloqueio rejeitada com sucesso.' });
  } catch (error: any) {
    // Em caso de erro, retorna uma resposta de erro 400.
    res.status(400).json({ message: error.message });
  }
};
