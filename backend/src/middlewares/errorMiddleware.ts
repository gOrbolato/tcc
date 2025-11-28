// Importa os tipos Request, Response e NextFunction do Express.
import { Request, Response, NextFunction } from 'express';

/**
 * @function errorHandler
 * @description Middleware para tratamento de erros. Captura erros que ocorrem na aplicação e envia uma resposta de erro padronizada.
 * @param {Error} err - O objeto de erro.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @param {NextFunction} next - A função que chama o próximo middleware.
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Imprime o stack trace do erro no console para depuração.
  console.error(err.stack);
  // Envia uma resposta de erro 500 com a mensagem de erro.
  res.status(500).json({ message: err.message || 'Ocorreu um erro inesperado no servidor.' });
};