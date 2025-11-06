"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const evaluationController_1 = require("../controllers/evaluationController");
const userEvaluationController_1 = require("../controllers/userEvaluationController"); // Importa a nova função
const authMiddleware_1 = require("../middlewares/authMiddleware");
const isAdmin_1 = require("../middlewares/isAdmin");
const router = (0, express_1.Router)();
// Rota para admin buscar avaliações com filtros
router.get('/', authMiddleware_1.authenticate, isAdmin_1.isAdmin, evaluationController_1.getEvaluations);
// Rota para usuário logado submeter uma nova avaliação
router.post('/', authMiddleware_1.authenticate, userEvaluationController_1.submitEvaluation);
// Rota para usuário logado buscar os detalhes de uma avaliação específica
// Rota para obter template de avaliação (usada para nova avaliação)
router.get('/template', authMiddleware_1.authenticate, evaluationController_1.getTemplate);
// Rota para verificar o status de avaliação do usuário (cooldown)
router.get('/user/status', authMiddleware_1.authenticate, evaluationController_1.getEvaluationStatus);
// Backwards-compatible routes expected by older frontend code
router.get('/user/available', authMiddleware_1.authenticate, evaluationController_1.getUserAvailable);
router.get('/user/completed', authMiddleware_1.authenticate, evaluationController_1.getUserCompleted);
// Rota para usuário logado buscar os detalhes de uma avaliação específica
router.get('/:id', authMiddleware_1.authenticate, userEvaluationController_1.getEvaluationDetailsById);
exports.default = router;
