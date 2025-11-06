import { Response } from 'express';
import * as consentService from '../services/consentService';

// Adicionando uma interface para estender o Request do Express
import { Request as ExpressRequest } from 'express';
interface AuthRequest extends ExpressRequest {
  user?: any;
}

export const submitConsent = async (req: AuthRequest, res: Response) => {
  try {
    // New payload: { type, agreed, version, source, metadata }
    const { type, agreed, version, source, metadata } = req.body;
    const ip_address = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string | undefined;
    const user_agent = req.headers['user-agent'] as string | undefined;

    const userId = req.user?.id || null;

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
    res.status(201).json({ message: 'Consentimento registrado com sucesso!', consent });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
