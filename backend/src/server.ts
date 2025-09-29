import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import evaluationRoutes from './routes/evaluationRoutes';
import adminRoutes from './routes/adminRoutes';
import consentRoutes from './routes/consentRoutes';
import adminUserRoutes from './routes/adminUserRoutes';
import institutionCourseRoutes from './routes/institutionCourseRoutes';

app.get('/', (req, res) => {
  res.send('API do Sistema de Avaliação Educacional funcionando!');
});

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', evaluationRoutes);
app.use('/api', adminRoutes);
app.use('/api', consentRoutes);
app.use('/api', adminUserRoutes);
app.use('/api', institutionCourseRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
