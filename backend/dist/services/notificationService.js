"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationAsRead = exports.getUnreadNotifications = exports.createReactivationRequest = void 0;
const database_1 = __importDefault(require("../config/database"));
const createReactivationRequest = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Verifica se já existe uma solicitação não lida para este usuário
    const [existing] = yield database_1.default.query('SELECT id FROM Notificacoes WHERE usuario_id = ? AND lida = FALSE', [userId]);
    if (existing.length > 0) {
        throw new Error('Você já tem uma solicitação de reativação pendente.');
    }
    const mensagem = 'Solicitação de reativação de matrícula.';
    yield database_1.default.query('INSERT INTO Notificacoes (usuario_id, mensagem) VALUES (?, ?)', [userId, mensagem]);
});
exports.createReactivationRequest = createReactivationRequest;
const getUnreadNotifications = () => __awaiter(void 0, void 0, void 0, function* () {
    const [notifications] = yield database_1.default.query(`SELECT n.id, n.mensagem, n.criado_em, u.nome, u.ra 
     FROM Notificacoes n 
     JOIN Usuarios u ON n.usuario_id = u.id 
     WHERE n.lida = FALSE 
     ORDER BY n.criado_em ASC`);
    return notifications;
});
exports.getUnreadNotifications = getUnreadNotifications;
const markNotificationAsRead = (notificationId) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.default.query('UPDATE Notificacoes SET lida = TRUE WHERE id = ?', [notificationId]);
});
exports.markNotificationAsRead = markNotificationAsRead;
