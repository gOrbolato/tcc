import pool from '../config/database';
import { OkPacket } from 'mysql2';

export const logAutoCreatedEntity = async (entityType: string, entityName: string, triggeredByEmail?: string | null, metadata?: any) => {
  await pool.query<OkPacket>('INSERT INTO AutoCreatedEntities (entity_type, entity_name, triggered_by_email, metadata) VALUES (?, ?, ?, ?)', [entityType, entityName, triggeredByEmail || null, metadata ? JSON.stringify(metadata) : null]);
};

export default { logAutoCreatedEntity };
