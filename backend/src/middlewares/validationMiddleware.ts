import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateRegister = [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório.'),
  body('cpf').optional().isString().isLength({ min: 11, max: 14 }).withMessage('CPF inválido.'),
  body('ra').isString().notEmpty().withMessage('RA é obrigatório.'),
  body('email').isEmail().withMessage('E-mail inválido.'),
  body('senha').isLength({ min: 8 }).withMessage('A senha deve ter no mínimo 8 caracteres.'),
  // Instituição/curso podem ser enviados como texto (institutionText/courseText) ou por id
  body('instituicao_id').optional().isInt({ min: 1 }).withMessage('Instituição inválida.'),
  body('curso_id').optional().isInt({ min: 1 }).withMessage('Curso inválido.'),
  body('institutionText').optional().isString().trim(),
  body('courseText').optional().isString().trim(),
  body('previsaoTermino').optional().matches(/^\d{4}-\d{2}$/).withMessage('Previsão de término deve estar no formato YYYY-MM.'),
  body('periodo').optional().notEmpty().withMessage('Período é obrigatório.'),
  body('semestre').optional().notEmpty().withMessage('Semestre é obrigatório.'),
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
  body('periodo').optional().isString().notEmpty().withMessage('Período não pode ser vazio.'),
  body('previsaoTermino').optional().matches(/^\d{4}-\d{2}$/).withMessage('Previsão de término deve estar no formato YYYY-MM.'),
];

export const validateConsent = [
  body('consentimento_cookies').isBoolean().withMessage('Consentimento de cookies deve ser um booleano.'),
  body('consentimento_localizacao').isBoolean().withMessage('Consentimento de localização deve ser um booleano.'),
];

export const validateConsentSubmission = [
  body('type').isString().notEmpty().withMessage('Tipo de consentimento é obrigatório.'),
  body('agreed').isBoolean().withMessage('Agreed deve ser booleano.'),
  body('version').optional().isString(),
  body('source').optional().isString(),
  body('metadata').optional(),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
