import pool from '../config/database';
import { OkPacket } from 'mysql2';

export const logAdminAction = async (adminId: number, action: string, targetUserId?: number | null, details?: any) => {
  const detailsStr = details ? JSON.stringify(details) : null;
  await pool.query<OkPacket>('INSERT INTO AdminActions (admin_id, target_user_id, action, details) VALUES (?, ?, ?, ?)', [adminId, targetUserId || null, action, detailsStr]);
};

export const getAdminActions = async (limit = 50, offset = 0) => {
  const [rows] = await pool.query('SELECT id, admin_id, target_user_id, action, details, created_at FROM AdminActions ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
  return rows as any[];
};

export default { logAdminAction };
