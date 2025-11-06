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
exports.markAsRead = exports.getNotifications = exports.requestReactivation = void 0;
const notificationService = __importStar(require("../services/notificationService"));
// Para o usuário criar uma solicitação
const requestReactivation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Não autorizado.' });
        yield notificationService.createReactivationRequest(req.user.id);
        res.status(201).json({ message: 'Sua solicitação foi enviada ao administrador.' });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.requestReactivation = requestReactivation;
// Para o admin ler as solicitações
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notifications = yield notificationService.getUnreadNotifications();
        res.status(200).json(notifications);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao buscar notificações.' });
    }
});
exports.getNotifications = getNotifications;
// Para o admin marcar uma solicitação como lida
const markAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notificationId = Number(req.params.id);
        yield notificationService.markNotificationAsRead(notificationId);
        res.status(200).json({ message: 'Notificação marcada como lida.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao processar solicitação.' });
    }
});
exports.markAsRead = markAsRead;
