"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analysisController_1 = require("../controllers/analysisController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Rota para obter a análise de uma instituição
// Protegida para que apenas administradores autenticados possam acessá-la
router.get('/analysis/institution/:id', authMiddleware_1.authenticate, authMiddleware_1.adminOnly, analysisController_1.getInstitutionAnalysis);
exports.default = router;
