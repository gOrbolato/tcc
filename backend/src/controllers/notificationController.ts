
import { Request, Response } from 'express';
import * as notificationService from '../services/notificationService';

interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

// Para o usuário criar uma solicitação
export const requestReactivation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Não autorizado.' });
    await notificationService.createReactivationRequest(req.user.id);
    res.status(201).json({ message: 'Sua solicitação foi enviada ao administrador.' });
  } catch (error: any) { res.status(400).json({ message: error.message }); }
};

// Para o admin ler as solicitações
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await notificationService.getUnreadNotifications();
    res.status(200).json(notifications);
  } catch (error: any) { res.status(500).json({ message: 'Erro ao buscar notificações.' }); }
};

// Para o admin marcar uma solicitação como lida
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notificationId = Number(req.params.id);
    await notificationService.markNotificationAsRead(notificationId);
    res.status(200).json({ message: 'Notificação marcada como lida.' });
  } catch (error: any) { res.status(500).json({ message: 'Erro ao processar solicitação.' }); }
};
