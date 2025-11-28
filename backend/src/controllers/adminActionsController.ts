// Importa os tipos Request e Response do Express para lidar com as requisições e respostas HTTP.
import { Request, Response } from 'express';
// Importa o serviço de ações do administrador para interagir com a lógica de negócio.
import * as adminActionsService from '../services/adminActionsService';

/**
 * @function listAdminActions
 * @description Lista as ações administrativas com paginação.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const listAdminActions = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtém e define um valor padrão para 'limit' e 'offset' da query string da requisição.
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const offset = parseInt((req.query.offset as string) || '0', 10);
    // Chama o serviço para buscar as ações administrativas do banco de dados.
    const rows = await adminActionsService.getAdminActions(limit, offset);
    // Envia as ações como resposta em formato JSON.
    res.json({ data: rows });
  } catch (err) {
    // Em caso de erro, loga a falha e retorna uma resposta de erro 500.
    console.error('Error fetching admin actions', err);
    res.status(500).json({ message: 'Erro ao buscar logs de admin' });
  }
};

// Exporta a função para ser utilizada nas rotas.
export default { listAdminActions };
