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
exports.getAdminActions = exports.logAdminAction = void 0;
const database_1 = __importDefault(require("../config/database"));
const logAdminAction = (adminId, action, targetUserId, details) => __awaiter(void 0, void 0, void 0, function* () {
    const detailsStr = details ? JSON.stringify(details) : null;
    yield database_1.default.query('INSERT INTO AdminActions (admin_id, target_user_id, action, details) VALUES (?, ?, ?, ?)', [adminId, targetUserId || null, action, detailsStr]);
});
exports.logAdminAction = logAdminAction;
const getAdminActions = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 50, offset = 0) {
    const [rows] = yield database_1.default.query('SELECT id, admin_id, target_user_id, action, details, created_at FROM AdminActions ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
    return rows;
});
exports.getAdminActions = getAdminActions;
exports.default = { logAdminAction: exports.logAdminAction };
