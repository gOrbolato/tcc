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
exports.requestDesbloqueio = exports.trancarCurso = exports.changePassword = exports.updateProfile = exports.getProfile = exports.updateUserAsAdmin = void 0;
const userService = __importStar(require("../services/userService"));
const adminActionsService = __importStar(require("../services/adminActionsService"));
// Função para admin atualizar um usuário
const updateUserAsAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = Number(req.params.id);
        const { instituicao_id, curso_id, is_active } = req.body;
        const dataToUpdate = {};
        if (instituicao_id !== undefined)
            dataToUpdate.instituicao_id = instituicao_id;
        if (curso_id !== undefined)
            dataToUpdate.curso_id = curso_id;
        if (is_active !== undefined)
            dataToUpdate.is_active = is_active;
        const updatedUser = yield userService.updateUserDetails(userId, dataToUpdate);
        res.status(200).json({ message: 'Usuário atualizado com sucesso!', user: updatedUser });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateUserAsAdmin = updateUserAsAdmin;
// --- FUNÇÕES ADICIONADAS PARA CORRIGIR O ERRO ---
// Função para o próprio usuário buscar seu perfil
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Não autorizado.' });
        }
        console.log("DEBUG userController: Buscando perfil para userId:", req.user.id, "isAdmin:", req.user.isAdmin);
        let userProfile;
        if (req.user.isAdmin) {
            userProfile = yield userService.getAdminById(req.user.id);
        }
        else {
            userProfile = yield userService.getUserById(req.user.id);
        }
        res.status(200).json(userProfile);
    }
    catch (error) {
        console.error("ERRO userController: Erro ao buscar perfil:", error);
        res.status(400).json({ message: error.message });
    }
});
exports.getProfile = getProfile;
// Função para o próprio usuário atualizar seu perfil
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Não autorizado.' });
        }
        // If admin is updating their own profile (or someone else's), capture previous data for audit
        let previousData = null;
        if (req.user.isAdmin) {
            try {
                previousData = yield userService.getUserById(req.user.id);
            }
            catch (e) {
                // ignore if cannot fetch
            }
        }
        const updatedProfile = yield userService.updateUserProfile(req.user.id, req.body, { allowAdminOverride: !!req.user.isAdmin });
        // Log admin action if admin
        if (req.user.isAdmin) {
            const changes = {};
            if (previousData) {
                for (const key of Object.keys(req.body)) {
                    const oldVal = previousData[key];
                    const newVal = req.body[key];
                    if (String(oldVal) !== String(newVal)) {
                        changes[key] = { from: oldVal, to: newVal };
                    }
                }
            }
            yield adminActionsService.logAdminAction(req.user.id, 'update_profile', req.user.id, { changes, ip: req.ip });
        }
        res.status(200).json({ message: 'Perfil atualizado com sucesso!', user: updatedProfile });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateProfile = updateProfile;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Não autorizado.' });
        const { senhaAntiga, novaSenha, targetUserId } = req.body;
        const targetId = targetUserId ? Number(targetUserId) : req.user.id;
        if (!novaSenha)
            return res.status(400).json({ message: 'Nova senha é obrigatória.' });
        if (req.user.isAdmin && targetUserId) {
            // admin changing someone else's password (or own without old password)
            yield userService.adminChangePassword(targetId, novaSenha);
        }
        else {
            // regular flow: must provide old password
            if (!senhaAntiga)
                return res.status(400).json({ message: 'Senha antiga é obrigatória.' });
            yield userService.changePassword(targetId, senhaAntiga, novaSenha);
        }
        res.status(200).json({ message: 'Senha alterada com sucesso.' });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.changePassword = changePassword;
const trancarCurso = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Não autorizado.' });
        const { motivo } = req.body;
        if (!motivo) {
            return res.status(400).json({ message: 'O motivo do trancamento é obrigatório.' });
        }
        const updated = yield userService.trancarCurso(req.user.id, motivo);
        res.status(200).json({ message: 'Curso trancado com sucesso.', user: updated });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.trancarCurso = trancarCurso;
const requestDesbloqueio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Não autorizado.' });
        const { motivo } = req.body;
        const result = yield userService.requestDesbloqueio(req.user.id, motivo);
        res.status(201).json({ message: 'Pedido de desbloqueio criado.', request: result });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.requestDesbloqueio = requestDesbloqueio;
