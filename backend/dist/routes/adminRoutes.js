"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const adminActionsController_1 = require("../controllers/adminActionsController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const isAdmin_1 = require("../middlewares/isAdmin");
const router = (0, express_1.Router)();
// Rota para admin baixar o relatório de avaliações
router.get('/report/download', authMiddleware_1.authenticate, isAdmin_1.isAdmin, adminController_1.downloadReport);
// Nova rota para admin buscar dados do relatório
router.get('/reports', authMiddleware_1.authenticate, isAdmin_1.isAdmin, adminController_1.getAdminReports);
// Nova rota para admin buscar notificações
router.get('/notifications', authMiddleware_1.authenticate, isAdmin_1.isAdmin, adminController_1.getAdminNotifications);
// Rota para listar ações de admin (logs)
router.get('/actions', authMiddleware_1.authenticate, isAdmin_1.isAdmin, adminActionsController_1.listAdminActions);
router.put('/perfil', authMiddleware_1.authenticate, isAdmin_1.isAdmin, adminController_1.updateAdminProfile);
exports.default = router;
