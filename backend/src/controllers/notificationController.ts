// Importa os tipos Request e Response do Express para lidar com as requisições e respostas HTTP.
import { Request, Response } from 'express';
// Importa o serviço de notificação para interagir com a lógica de negócio.
import * as notificationService from '../services/notificationService';

// Define uma interface para requisições autenticadas, que podem conter informações do usuário.
interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

/**
 * @function requestReactivation
 * @description Cria uma solicitação de reativação de conta para o usuário autenticado.
 * @param {AuthenticatedRequest} req - O objeto de requisição autenticada do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const requestReactivation = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    // Verifica se o usuário está autenticado.
    if (!req.user) return res.status(401).json({ message: 'Não autorizado.' });
    // Chama o serviço para criar a solicitação de reativação.
    await notificationService.createReactivationRequest(req.user.id);
    // Retorna uma mensagem de sucesso.
    return res.status(201).json({ message: 'Sua solicitação foi enviada ao administrador.' });
  } catch (error: any) { 
    // Em caso de erro, retorna uma resposta de erro 400.
    return res.status(400).json({ message: error.message }); 
  }
};

/**
 * @function getNotifications
 * @description Busca e retorna as notificações não lidas para o administrador.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    // Chama o serviço para obter as notificações não lidas.
    const notifications = await notificationService.getUnreadNotifications();
    res.status(200).json(notifications);
  } catch (error: any) { 
    // Em caso de erro, retorna uma resposta de erro 500.
    res.status(500).json({ message: 'Erro ao buscar notificações.' }); 
  }
};

/**
 * @function markAsRead
 * @description Marca uma notificação como lida pelo administrador.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const notificationId = Number(req.params.id);
    // Chama o serviço para marcar a notificação como lida.
    await notificationService.markNotificationAsRead(notificationId);
    res.status(200).json({ message: 'Notificação marcada como lida.' });
  } catch (error: any) { 
    // Em caso de erro, retorna uma resposta de erro 500.
    res.status(500).json({ message: 'Erro ao processar solicitação.' }); 
  }
};
