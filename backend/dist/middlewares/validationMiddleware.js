"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationErrors = exports.validateConsentSubmission = exports.validateConsent = exports.validateUpdateProfile = exports.validateEvaluation = exports.validateRegister = void 0;
const express_validator_1 = require("express-validator");
exports.validateRegister = [
    (0, express_validator_1.body)('nome').trim().notEmpty().withMessage('Nome é obrigatório.'),
    (0, express_validator_1.body)('cpf').optional().isString().isLength({ min: 11, max: 14 }).withMessage('CPF inválido.'),
    (0, express_validator_1.body)('ra').isString().notEmpty().withMessage('RA é obrigatório.'),
    (0, express_validator_1.body)('email').isEmail().withMessage('E-mail inválido.'),
    (0, express_validator_1.body)('senha').isLength({ min: 8 }).withMessage('A senha deve ter no mínimo 8 caracteres.'),
    // Instituição/curso podem ser enviados como texto (institutionText/courseText) ou por id
    (0, express_validator_1.body)('instituicao_id').optional().isInt({ min: 1 }).withMessage('Instituição inválida.'),
    (0, express_validator_1.body)('curso_id').optional().isInt({ min: 1 }).withMessage('Curso inválido.'),
    (0, express_validator_1.body)('institutionText').optional().isString().trim(),
    (0, express_validator_1.body)('courseText').optional().isString().trim(),
    (0, express_validator_1.body)('previsaoTermino').optional().matches(/^\d{4}-\d{2}$/).withMessage('Previsão de término deve estar no formato YYYY-MM.'),
    (0, express_validator_1.body)('periodo').optional().notEmpty().withMessage('Período é obrigatório.'),
    (0, express_validator_1.body)('semestre').optional().notEmpty().withMessage('Semestre é obrigatório.'),
];
exports.validateEvaluation = [
    (0, express_validator_1.body)('instituicao_id').isInt({ min: 1 }).withMessage('ID da instituição inválido.'),
    (0, express_validator_1.body)('curso_id').isInt({ min: 1 }).withMessage('ID do curso inválido.'),
    (0, express_validator_1.body)('nota_infraestrutura').isInt({ min: 1, max: 5 }).withMessage('Nota de infraestrutura deve ser entre 1 e 5.'),
    (0, express_validator_1.body)('obs_infraestrutura').optional().isString().trim().isLength({ max: 500 }).withMessage('Observação de infraestrutura muito longa.'),
    (0, express_validator_1.body)('nota_material_didatico').isInt({ min: 1, max: 5 }).withMessage('Nota de material didático deve ser entre 1 e 5.'),
    (0, express_validator_1.body)('obs_material_didatico').optional().isString().trim().isLength({ max: 500 }).withMessage('Observação de material didático muito longa.'),
];
exports.validateUpdateProfile = [
    (0, express_validator_1.body)('periodo').optional().isString().notEmpty().withMessage('Período não pode ser vazio.'),
    (0, express_validator_1.body)('previsaoTermino').optional().matches(/^\d{4}-\d{2}$/).withMessage('Previsão de término deve estar no formato YYYY-MM.'),
];
exports.validateConsent = [
    (0, express_validator_1.body)('consentimento_cookies').isBoolean().withMessage('Consentimento de cookies deve ser um booleano.'),
    (0, express_validator_1.body)('consentimento_localizacao').isBoolean().withMessage('Consentimento de localização deve ser um booleano.'),
];
exports.validateConsentSubmission = [
    (0, express_validator_1.body)('type').isString().notEmpty().withMessage('Tipo de consentimento é obrigatório.'),
    (0, express_validator_1.body)('agreed').isBoolean().withMessage('Agreed deve ser booleano.'),
    (0, express_validator_1.body)('version').optional().isString(),
    (0, express_validator_1.body)('source').optional().isString(),
    (0, express_validator_1.body)('metadata').optional(),
];
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
