// Importa os tipos Request, Response e NextFunction do Express.
import { Request, Response, NextFunction } from 'express';
// Importa a biblioteca jsonwebtoken para lidar com tokens JWT.
import jwt from 'jsonwebtoken';

// Define o segredo para a assinatura e verificação de tokens JWT.
const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_jwt_aqui';

// Estende a interface Request do Express para incluir a propriedade 'user'.
interface AuthRequest extends Request {
  user?: any;
}

/**
 * @function authenticate
 * @description Middleware para autenticar requisições verificando um token JWT.
 * @param {AuthRequest} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @param {NextFunction} next - A função que chama o próximo middleware.
 * @returns {Response | void}
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
  const authHeader = req.headers.authorization;

  // Verifica se o cabeçalho de autorização está presente e no formato correto.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
  }

  // Extrai o token do cabeçalho.
  const token = authHeader.split(' ')[1];

  try {
    // Verifica e decodifica o token JWT.
    const decoded = jwt.verify(token, JWT_SECRET);
    // Adiciona os dados decodificados do usuário ao objeto de requisição.
    req.user = decoded;
    // Passa para o próximo middleware.
    next();
  } catch (error) {
    // Se o token for inválido, retorna um erro de autenticação.
    res.status(401).json({ message: 'Token inválido.' });
  }
};

/**
 * @function adminOnly
 * @description Middleware para restringir o acesso a rotas apenas para administradores.
 * @param {AuthRequest} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @param {NextFunction} next - A função que chama o próximo middleware.
 * @returns {Response | void}
 */
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
  // Verifica se o usuário está autenticado e se é um administrador.
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Acesso negado. Rota exclusiva para administradores.' });
  }
  // Se for administrador, passa para o próximo middleware.
  next();
};
