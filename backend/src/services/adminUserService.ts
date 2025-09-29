import pool from '../config/database';
import { OkPacket, RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';

export const createAdmin = async (adminData: any) => {
  const { nome, email, senha } = adminData;

  const [existingAdmins] = await pool.query<RowDataPacket[]>('SELECT * FROM Admins WHERE email = ?', [email]);
  if (existingAdmins.length > 0) {
    throw new Error('E-mail de administrador já cadastrado.');
  }

  const hashedPassword = await bcrypt.hash(senha, 10);

  const [result] = await pool.query<OkPacket>(
    'INSERT INTO Admins (nome, email, senha) VALUES (?, ?, ?)',
    [nome, email, hashedPassword]
  );

  const [newAdmin] = await pool.query<RowDataPacket[]>('SELECT id, nome, email FROM Admins WHERE id = ?', [result.insertId]);
  return newAdmin[0];
};

export const getAdmins = async () => {
  const [admins] = await pool.query<RowDataPacket[]>('SELECT id, nome, email FROM Admins');
  return admins;
};

export const updateAdmin = async (adminId: number, adminData: any) => {
  const { nome, email, senha } = adminData;
  const fieldsToUpdate: any = {};

  if (nome) fieldsToUpdate.nome = nome;
  if (email) fieldsToUpdate.email = email;
  if (senha) fieldsToUpdate.senha = await bcrypt.hash(senha, 10);

  if (Object.keys(fieldsToUpdate).length === 0) {
    throw new Error('Nenhum dado para atualizar.');
  }

  await pool.query('UPDATE Admins SET ? WHERE id = ?', [fieldsToUpdate, adminId]);

  const [updatedAdmin] = await pool.query<RowDataPacket[]>('SELECT id, nome, email FROM Admins WHERE id = ?', [adminId]);
  return updatedAdmin[0];
};

export const deleteAdmin = async (adminId: number) => {
  const [result] = await pool.query<OkPacket>('DELETE FROM Admins WHERE id = ?', [adminId]);
  if (result.affectedRows === 0) {
    throw new Error('Administrador não encontrado.');
  }
};
