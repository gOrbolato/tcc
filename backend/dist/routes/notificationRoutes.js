"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Rota para o usuário criar uma solicitação de reativação
router.post('/reactivation-request', authMiddleware_1.authenticate, notificationController_1.requestReactivation);
exports.default = router;
