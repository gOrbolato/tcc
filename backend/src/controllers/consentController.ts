import { Response } from 'express';
import * as consentService from '../services/consentService';

// Adicionando uma interface para estender o Request do Express
import { Request as ExpressRequest } from 'express';
interface AuthRequest extends ExpressRequest {
  user?: any;
}

export const submitConsent = async (req: AuthRequest, res: Response) => {
  try {
    const { consentimento_cookies, consentimento_localizacao } = req.body;
    const ip_address = req.ip; // Obtém o IP do cliente
    const user_agent = req.headers['user-agent']; // Obtém o User-Agent

    const consent = await consentService.submitConsent(
      req.user.id,
      consentimento_cookies,
      consentimento_localizacao,
      ip_address,
      user_agent
    );
    res.status(201).json({ message: 'Consentimento registrado com sucesso!', consent });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
