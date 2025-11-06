import { Request, Response } from 'express';
import * as desbloqueioService from '../services/desbloqueioService';

export const getPendingDesbloqueios = async (_req: Request, res: Response) => {
  try {
    const requests = await desbloqueioService.getPendingDesbloqueios();
    res.status(200).json(requests);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar solicitações de desbloqueio.', error: error.message });
  }
};

export const approveDesbloqueio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await desbloqueioService.approveDesbloqueio(Number(id));
    res.status(200).json({ message: 'Solicitação de desbloqueio aprovada com sucesso.' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const rejectDesbloqueio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await desbloqueioService.rejectDesbloqueio(Number(id));
    res.status(200).json({ message: 'Solicitação de desbloqueio rejeitada com sucesso.' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
