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
exports.logAutoCreatedEntity = void 0;
const database_1 = __importDefault(require("../config/database"));
const logAutoCreatedEntity = (entityType, entityName, triggeredByEmail, metadata) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.default.query('INSERT INTO AutoCreatedEntities (entity_type, entity_name, triggered_by_email, metadata) VALUES (?, ?, ?, ?)', [entityType, entityName, triggeredByEmail || null, metadata ? JSON.stringify(metadata) : null]);
});
exports.logAutoCreatedEntity = logAutoCreatedEntity;
exports.default = { logAutoCreatedEntity: exports.logAutoCreatedEntity };
