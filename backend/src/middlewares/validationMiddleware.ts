import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateRegister = [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório.'),
  body('cpf').isString().isLength({ min: 11, max: 14 }).withMessage('CPF inválido.'),
  body('ra').isString().notEmpty().withMessage('RA é obrigatório.'),
  body('idade').isInt({ min: 10, max: 100 }).withMessage('Idade inválida.'),
  body('email').isEmail().withMessage('E-mail inválido.'),
  body('senha').isLength({ min: 8 }).withMessage('A senha deve ter no mínimo 8 caracteres.'),
  body('instituicao').notEmpty().withMessage('Instituição é obrigatória.'),
  body('curso').notEmpty().withMessage('Curso é obrigatório.'),
  body('periodo').notEmpty().withMessage('Período é obrigatório.'),
  body('semestre').notEmpty().withMessage('Semestre é obrigatório.'),
];

export const validateEvaluation = [
  body('instituicao_id').isInt({ min: 1 }).withMessage('ID da instituição inválido.'),
  body('curso_id').isInt({ min: 1 }).withMessage('ID do curso inválido.'),
  body('nota_infraestrutura').isInt({ min: 1, max: 5 }).withMessage('Nota de infraestrutura deve ser entre 1 e 5.'),
  body('obs_infraestrutura').optional().isString().trim().isLength({ max: 500 }).withMessage('Observação de infraestrutura muito longa.'),
  body('nota_material_didatico').isInt({ min: 1, max: 5 }).withMessage('Nota de material didático deve ser entre 1 e 5.'),
  body('obs_material_didatico').optional().isString().trim().isLength({ max: 500 }).withMessage('Observação de material didático muito longa.'),
];

export const validateUpdateProfile = [
  body('curso').optional().isString().notEmpty().withMessage('Curso não pode ser vazio.'),
  body('instituicao').optional().isString().notEmpty().withMessage('Instituição não pode ser vazia.'),
  body('periodo').optional().isString().notEmpty().withMessage('Período não pode ser vazio.'),
  body('novaSenha').optional().isLength({ min: 8 }).withMessage('A nova senha deve ter no mínimo 8 caracteres.'),
];

export const validateConsent = [
  body('consentimento_cookies').isBoolean().withMessage('Consentimento de cookies deve ser um booleano.'),
  body('consentimento_localizacao').isBoolean().withMessage('Consentimento de localização deve ser um booleano.'),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
