import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

// Função auxiliar para gerar um código de 3 letras e 4 números
const generateRandomCode = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 4; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
};

// Placeholder para envio de e-mail (substituir por um serviço real)
const sendEmail = async (to: string, subject: string, text: string) => {
  console.log('--- SIMULANDO ENVIO DE E-MAIL DE DESBLOQUEIO ---');
  console.log(`Para: ${to}`);
  console.log(`Assunto: ${subject}`);
  console.log('Corpo: ' + text);
  console.log('----------------------------------');
};

export const getPendingDesbloqueios = async () => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT d.id, d.motivo, d.criado_em, u.nome, u.email
    FROM Desbloqueios d
    JOIN Usuarios u ON d.usuario_id = u.id
    WHERE d.status = 'PENDING'
    ORDER BY d.criado_em ASC
  `
  );
  return rows;
};

export const approveDesbloqueio = async (desbloqueioId: number) => {
  const [desbloqueioRows] = await pool.query<RowDataPacket[]>(
    'SELECT d.*, u.email FROM Desbloqueios d JOIN Usuarios u ON d.usuario_id = u.id WHERE d.id = ?',
    [desbloqueioId]
  );

  if (desbloqueioRows.length === 0) {
    throw new Error('Solicitação de desbloqueio não encontrada.');
  }

  const desbloqueio = desbloqueioRows[0];
  const userEmail = desbloqueio.email;

  if (desbloqueio.status !== 'PENDING') {
    throw new Error('Esta solicitação já foi processada.');
  }

  const verificationCode = generateRandomCode();
  const codeExpiresAt = new Date(Date.now() + 3600000); // Expira em 1 hora

  await pool.query(
    'UPDATE Desbloqueios SET status = \'APPROVED\', verification_code = ?, code_expires_at = ? WHERE id = ?',
    [verificationCode, codeExpiresAt, desbloqueioId]
  );

  // Enviar e-mail com o código para o usuário
  await sendEmail(
    userEmail,
    'Seu Pedido de Desbloqueio foi Aprovado',
    `Olá,\n\nSua solicitação de desbloqueio de conta foi aprovada.\nUse o seguinte código para reativar seu acesso: ${verificationCode}\nEste código expira em 1 hora.\n`
  );

  // Não alteramos mais a tabela Usuarios aqui. Isso será feito após a validação do código.
};


export const rejectDesbloqueio = async (desbloqueioId: number) => {
  await pool.query('UPDATE Desbloqueios SET status = \'REJECTED\' WHERE id = ?', [desbloqueioId]);
};

