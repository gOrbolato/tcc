import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorMiddleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(errorHandler);

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import evaluationRoutes from './routes/evaluationRoutes';
import adminRoutes from './routes/adminRoutes';
import consentRoutes from './routes/consentRoutes';
import adminUserRoutes from './routes/adminUserRoutes';
import institutionCourseRoutes from './routes/institutionCourseRoutes';
import notificationRoutes from './routes/notificationRoutes';
import desbloqueioRoutes from './routes/desbloqueioRoutes';
import analysisRoutes from './routes/analysisRoutes'; // <-- ADICIONADO

app.get('/', (req, res) => {
  res.send('API do Sistema de Avaliação Educacional funcionando!');
});

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', consentRoutes);
app.use('/api/admin', adminUserRoutes);
app.use('/api/entities', institutionCourseRoutes);
// Backwards-compatible mount so frontend code that calls '/api/institutions' still works
app.use('/api', institutionCourseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin/desbloqueios', desbloqueioRoutes);
app.use('/api', analysisRoutes); // <-- ADICIONADO

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});