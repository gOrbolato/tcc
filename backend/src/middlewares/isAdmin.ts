import { Request, Response, NextFunction } from 'express';

// Interface para garantir que o objeto 'user' no Request tenha a tipagem correta
interface AuthRequest extends Request {
  user?: {
    id: number;
    nome: string;
    isAdmin: boolean;
  };
}

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Verifica se o objeto user existe e se a propriedade isAdmin é verdadeira
  if (req.user && req.user.isAdmin) {
    // Se for admin, permite que a requisição continue
    next();
  } else {
    // Se não for admin, retorna um erro de "Acesso Proibido"
    return res.status(403).json({ message: 'Acesso negado: Requer privilégios de administrador.' });
  }
};