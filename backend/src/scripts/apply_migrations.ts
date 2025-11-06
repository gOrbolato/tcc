import fs from 'fs';
import path from 'path';
import pool from '../config/database';

async function applyMigrations() {
  const migrationsDir = path.resolve(__dirname, '../../migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const fullPath = path.join(migrationsDir, file);
    console.log('Applying', file);
    const sql = fs.readFileSync(fullPath, 'utf8');
    try {
      // Split on semicolon + newline to avoid partial statements issues
      const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
      for (const stmt of statements) {
        try {
          await pool.query(stmt);
        } catch (err: any) {
          const msg = (err && err.message) ? err.message : String(err);
          // Ignore common "already exists" errors and continue
          if (msg.includes('Duplicate column') || msg.includes('Duplicate key') || msg.includes('already exists') || (err.code && (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_KEY'))) {
            console.warn(`Warning: statement skipped due to existing object: ${msg}`);
            continue;
          }
          // For other errors rethrow to be caught by outer catch
          throw err;
        }
      }
      console.log('Applied', file);
    } catch (err: any) {
      console.error('Error applying', file, err.message || err);
      process.exit(1);
    }
  }
  console.log('All migrations applied.');
  process.exit(0);
}

applyMigrations();
