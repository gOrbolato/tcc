"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorMiddleware_1 = require("./middlewares/errorMiddleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(errorMiddleware_1.errorHandler);
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const evaluationRoutes_1 = __importDefault(require("./routes/evaluationRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const consentRoutes_1 = __importDefault(require("./routes/consentRoutes"));
const adminUserRoutes_1 = __importDefault(require("./routes/adminUserRoutes"));
const institutionCourseRoutes_1 = __importDefault(require("./routes/institutionCourseRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const desbloqueioRoutes_1 = __importDefault(require("./routes/desbloqueioRoutes"));
const analysisRoutes_1 = __importDefault(require("./routes/analysisRoutes")); // <-- ADICIONADO
app.get('/', (req, res) => {
    res.send('API do Sistema de Avaliação Educacional funcionando!');
});
app.use('/api/auth', authRoutes_1.default);
app.use('/api', userRoutes_1.default);
app.use('/api/evaluations', evaluationRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api', consentRoutes_1.default);
app.use('/api/admin', adminUserRoutes_1.default);
app.use('/api/entities', institutionCourseRoutes_1.default);
// Backwards-compatible mount so frontend code that calls '/api/institutions' still works
app.use('/api', institutionCourseRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/admin/desbloqueios', desbloqueioRoutes_1.default);
app.use('/api', analysisRoutes_1.default); // <-- ADICIONADO
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
