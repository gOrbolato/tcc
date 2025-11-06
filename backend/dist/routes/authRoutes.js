"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const router = (0, express_1.Router)();
router.post('/register', validationMiddleware_1.validateRegister, validationMiddleware_1.handleValidationErrors, authController_1.register);
router.post('/login', authController_1.login);
// Rotas para recuperação de senha
router.post('/forgot-password', authController_1.forgotPassword);
router.post('/validate-reset-code', authController_1.validateResetCode);
router.post('/reset-password', authController_1.resetPassword);
// Rota para reativação de conta trancada
router.post('/validate-unlock-code', authController_1.validateUnlockCode);
exports.default = router;
