import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';

export const getProfile = async (userId: number) => {
  const [users] = await pool.query<RowDataPacket[]>('SELECT id, nome, email, cpf, ra, idade, instituicao_id, curso_id, periodo, semestre FROM Usuarios WHERE id = ?', [userId]);
  if (users.length === 0) {
    throw new Error('Usuário não encontrado.');
  }
  return users[0];
};

export const updateProfile = async (userId: number, userData: any) => {
  const { curso, instituicao, periodo, novaSenha } = userData;

  // Lógica para atualizar os campos. Apenas os campos fornecidos serão atualizados.
  const fieldsToUpdate: any = {};
  if (curso) fieldsToUpdate.curso_id = curso;
  if (instituicao) fieldsToUpdate.instituicao_id = instituicao;
  if (periodo) fieldsToUpdate.periodo = periodo;

  if (novaSenha) {
    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    fieldsToUpdate.senha = hashedPassword;
  }

  if (Object.keys(fieldsToUpdate).length > 0) {
    await pool.query('UPDATE Usuarios SET ? WHERE id = ?', [fieldsToUpdate, userId]);
  }

  return await getProfile(userId);
};
