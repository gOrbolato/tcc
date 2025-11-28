// Importa os tipos Request, Response e NextFunction do Express.
import { Request, Response, NextFunction } from 'express';

// Define uma interface para requisições autenticadas, garantindo que a propriedade 'user' tenha a tipagem correta.
interface AuthRequest extends Request {
  user?: {
    id: number;
    nome: string;
    isAdmin: boolean;
  };
}

/**
 * @function isAdmin
 * @description Middleware para verificar se o usuário autenticado é um administrador.
 * @param {AuthRequest} req - O objeto de requisição do Express, estendido com a propriedade 'user'.
 * @param {Response} res - O objeto de resposta do Express.
 * @param {NextFunction} next - A função que chama o próximo middleware.
 * @returns {Response | void}
 */
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
  // Verifica se a propriedade 'user' existe na requisição e se 'isAdmin' é true.
  if (req.user && req.user.isAdmin) {
    // Se for um administrador, permite que a requisição continue para o próximo middleware ou rota.
    next();
  } else {
    // Se não for um administrador, retorna um erro 403 (Acesso Proibido).
    return res.status(403).json({ message: 'Acesso negado: Requer privilégios de administrador.' });
  }
};