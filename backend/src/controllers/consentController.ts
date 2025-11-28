// Importa o tipo Response do Express para lidar com as respostas HTTP.
import { Response } from 'express';
// Importa o serviço de consentimento para interagir com a lógica de negócio.
import * as consentService from '../services/consentService';

// Importa o tipo Request do Express e o estende para incluir informações do usuário.
import { Request as ExpressRequest } from 'express';
interface AuthRequest extends ExpressRequest {
  user?: any;
}

/**
 * @function submitConsent
 * @description Registra o consentimento de um usuário.
 * @param {AuthRequest} req - O objeto de requisição autenticada do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const submitConsent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Extrai os dados do consentimento do corpo da requisição.
    const { type, agreed, version, source, metadata } = req.body;
    // Obtém o endereço IP e o user agent do cliente a partir dos cabeçalhos da requisição.
    const ip_address = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string | undefined;
    const user_agent = req.headers['user-agent'] as string | undefined;

    // Obtém o ID do usuário a partir da requisição autenticada.
    const userId = req.user?.id || null;

    // Chama o serviço para registrar o consentimento.
    const consent = await consentService.submitConsent(
      userId,
      type,
      Boolean(agreed),
      version,
      source,
      metadata,
      ip_address,
      user_agent
    );
    // Retorna uma mensagem de sucesso com os dados do consentimento registrado.
    res.status(201).json({ message: 'Consentimento registrado com sucesso!', consent });
  } catch (error: any) {
    // Em caso de erro, retorna uma resposta de erro 400.
    res.status(400).json({ message: error.message });
  }
};
