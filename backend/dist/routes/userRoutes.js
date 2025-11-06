"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express"); // A linha que faltava
const userController_1 = require("../controllers/userController");
const userController_2 = require("../controllers/userController");
const evaluationController_1 = require("../controllers/evaluationController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const router = (0, express_1.Router)();
// Rotas de Perfil
router.get('/perfil', authMiddleware_1.authenticate, userController_1.getProfile);
router.put('/perfil', authMiddleware_1.authenticate, validationMiddleware_1.validateUpdateProfile, validationMiddleware_1.handleValidationErrors, userController_1.updateProfile);
router.put('/change-password', authMiddleware_1.authenticate, userController_2.changePassword);
// Trancar curso e solicitar desbloqueio
router.post('/trancar-curso', authMiddleware_1.authenticate, userController_1.trancarCurso);
router.post('/request-desbloqueio', authMiddleware_1.authenticate, userController_1.requestDesbloqueio);
// Rota para buscar as avaliações do usuário logado
router.get('/my-evaluations', authMiddleware_1.authenticate, evaluationController_1.getMyEvaluations);
exports.default = router;
