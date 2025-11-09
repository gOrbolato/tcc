/*
  Script de verificação rápida do banco de dados.
  Uso: node scripts/check_db.js
  Ele usa as variáveis de ambiente do projeto (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).
*/
const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tcc',
    waitForConnections: true,
    connectionLimit: 5,
  });

  try {
  console.log('\n--- Listando Instituições (até 20) ---');
    const [institutions] = await pool.query('SELECT id, nome FROM Instituicoes LIMIT 20');
    console.table(institutions);

    console.log('\n--- Listando Cursos (até 50) ---');
    const [courses] = await pool.query('SELECT id, nome, instituicao_id FROM Cursos LIMIT 50');
    console.table(courses);

  console.log('\n--- Listando Usuários (até 50) ---');
    const [users] = await pool.query('SELECT id, nome, email, instituicao_id, curso_id, anonymized_id, is_active FROM Usuarios LIMIT 50');
    console.table(users);

  console.log('\n--- Verificando usuários com instituicao_id inexistente ---');
    const [badInst] = await pool.query(`
      SELECT u.id, u.nome, u.instituicao_id FROM Usuarios u
      LEFT JOIN Instituicoes i ON u.instituicao_id = i.id
      WHERE u.instituicao_id IS NOT NULL AND i.id IS NULL
      LIMIT 50
    `);
    console.table(badInst);

  console.log('\n--- Verificando usuários com curso_id inexistente ---');
    const [badCourse] = await pool.query(`
      SELECT u.id, u.nome, u.curso_id FROM Usuarios u
      LEFT JOIN Cursos c ON u.curso_id = c.id
      WHERE u.curso_id IS NOT NULL AND c.id IS NULL
      LIMIT 50
    `);
    console.table(badCourse);

    console.log('\n--- Verificação concluída ---');
  } catch (err) {
    console.error('Erro ao verificar DB:', err);
  } finally {
    await pool.end();
  }
}

main();
