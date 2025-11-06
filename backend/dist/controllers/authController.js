"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.validateResetCode = exports.forgotPassword = exports.validateUnlockCode = exports.login = exports.register = void 0;
const authService = __importStar(require("../services/authService"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield authService.register(req.body);
        res.status(201).json({ message: 'Usuário registrado com sucesso!', user });
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Erro ao registrar usuário.' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, user } = yield authService.login(req.body.email, req.body.senha);
        res.status(200).json({ token, user });
    }
    catch (error) {
        // MODIFICADO: Retorna 403 para conta trancada, para que o frontend possa redirecionar
        if (error.message === 'ACCOUNT_LOCKED') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message.includes('inválidos')) {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: 'Ocorreu um erro inesperado no servidor.' });
    }
});
exports.login = login;
const validateUnlockCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cpf, code } = req.body;
        if (!cpf || !code) {
            return res.status(400).json({ message: 'CPF e código são obrigatórios.' });
        }
        const result = yield authService.validateUnlockCode(cpf, code);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Erro ao validar o código de desbloqueio.' });
    }
});
exports.validateUnlockCode = validateUnlockCode;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield authService.forgotPassword(req.body.email);
        // For security do not return the code in the API response.
        res.status(200).json({ message: 'Se o e-mail estiver cadastrado, um código de recuperação foi enviado.' });
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Erro ao processar a solicitação de recuperação de senha.' });
    }
});
exports.forgotPassword = forgotPassword;
const validateResetCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, code } = req.body;
        yield authService.validateResetCode(email, code);
        res.status(200).json({ message: 'Código validado com sucesso.' });
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Erro ao validar o código.' });
    }
});
exports.validateResetCode = validateResetCode;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, newPassword } = req.body; // Remove 'code'
        yield authService.resetPassword(email, newPassword);
        res.status(200).json({ message: 'Senha redefinida com sucesso.' });
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Erro ao redefinir a senha.' });
    }
});
exports.resetPassword = resetPassword;
