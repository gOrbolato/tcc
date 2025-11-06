"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const isAdmin_1 = require("../middlewares/isAdmin");
const adminUserController_1 = require("../controllers/adminUserController");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
// Rota para admin buscar usuários (com filtros)
router.get('/users', authMiddleware_1.authenticate, isAdmin_1.isAdmin, adminUserController_1.getAllUsers);
// Rota para admin atualizar detalhes de um usuário comum
router.patch('/users/:id', authMiddleware_1.authenticate, isAdmin_1.isAdmin, userController_1.updateUserAsAdmin);
// Rotas para gerenciar pedidos de desbloqueio
router.get('/desbloqueios', authMiddleware_1.authenticate, isAdmin_1.isAdmin, adminUserController_1.listDesbloqueios);
router.post('/desbloqueios/:id/approve', authMiddleware_1.authenticate, isAdmin_1.isAdmin, adminUserController_1.approveDesbloqueio);
router.post('/desbloqueios/:id/reject', authMiddleware_1.authenticate, isAdmin_1.isAdmin, adminUserController_1.rejectDesbloqueio);
router.delete('/users/:id', authMiddleware_1.authenticate, isAdmin_1.isAdmin, adminUserController_1.deleteUser);
exports.default = router;
