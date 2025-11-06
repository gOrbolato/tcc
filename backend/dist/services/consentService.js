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
exports.submitConsent = void 0;
const database_1 = __importDefault(require("../config/database"));
const submitConsent = (userId, type, agreed, version, source, metadata, ip_address, user_agent) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield database_1.default.query('INSERT INTO Consents (user_id, `type`, agreed, version, source, metadata, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [userId || null, type, agreed ? 1 : 0, version || null, source || null, metadata ? JSON.stringify(metadata) : null, ip_address || null, user_agent || null]);
    return { id: result.insertId, userId, type, agreed, version, source, metadata, ip_address, user_agent };
});
exports.submitConsent = submitConsent;
