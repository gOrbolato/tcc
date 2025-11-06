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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("../config/database"));
function applyMigrations() {
    return __awaiter(this, void 0, void 0, function* () {
        const migrationsDir = path_1.default.resolve(__dirname, '../../migrations');
        const files = fs_1.default.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
        for (const file of files) {
            const fullPath = path_1.default.join(migrationsDir, file);
            console.log('Applying', file);
            const sql = fs_1.default.readFileSync(fullPath, 'utf8');
            try {
                // Split on semicolon + newline to avoid partial statements issues
                const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
                for (const stmt of statements) {
                    try {
                        yield database_1.default.query(stmt);
                    }
                    catch (err) {
                        const msg = (err && err.message) ? err.message : String(err);
                        // Ignore common "already exists" errors and continue
                        if (msg.includes('Duplicate column') || msg.includes('Duplicate key') || msg.includes('already exists') || (err.code && (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_KEY'))) {
                            console.warn(`Warning: statement skipped due to existing object: ${msg}`);
                            continue;
                        }
                        // For other errors rethrow to be caught by outer catch
                        throw err;
                    }
                }
                console.log('Applied', file);
            }
            catch (err) {
                console.error('Error applying', file, err.message || err);
                process.exit(1);
            }
        }
        console.log('All migrations applied.');
        process.exit(0);
    });
}
applyMigrations();
