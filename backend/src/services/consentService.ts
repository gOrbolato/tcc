import pool from '../config/database';
import { OkPacket } from 'mysql2';

export const submitConsent = async (
  userId: number,
  consentimento_cookies: boolean,
  consentimento_localizacao: boolean,
  ip_address?: string,
  user_agent?: string
) => {
  const [result] = await pool.query<OkPacket>(
    'INSERT INTO Consentimento (usuario_id, consentimento_cookies, consentimento_localizacao, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
    [userId, consentimento_cookies, consentimento_localizacao, ip_address, user_agent]
  );

  return { id: result.insertId, userId, consentimento_cookies, consentimento_localizacao, ip_address, user_agent };
};
