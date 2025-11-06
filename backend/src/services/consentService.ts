import pool from '../config/database';
import { OkPacket } from 'mysql2';

export const submitConsent = async (
  userId: number,
  type: string,
  agreed: boolean,
  version?: string,
  source?: string,
  metadata?: any,
  ip_address?: string,
  user_agent?: string
) => {
  const [result] = await pool.query<OkPacket>(
    'INSERT INTO Consents (user_id, `type`, agreed, version, source, metadata, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [userId || null, type, agreed ? 1 : 0, version || null, source || null, metadata ? JSON.stringify(metadata) : null, ip_address || null, user_agent || null]
  );

  return { id: result.insertId, userId, type, agreed, version, source, metadata, ip_address, user_agent };
};
