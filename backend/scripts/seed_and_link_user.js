/*
  Script para inserir uma instituição e curso de teste e vincular ao primeiro usuário sem instituicao_id/curso_id.
  Uso: node scripts/seed_and_link_user.js
  Atenção: este script modifica dados. Use em dev.
*/
const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tcc',
    connectionLimit: 5,
  });

  try {
    // Find a user missing institution or course
    const [users] = await pool.query("SELECT id, anonymized_id FROM Usuarios WHERE instituicao_id IS NULL OR curso_id IS NULL LIMIT 1");
    if (!users || users.length === 0) {
      console.log('Nenhum usuário encontrado que precise de vinculação. Saindo.');
      return;
    }
    const user = users[0];
    console.log('Encontrado usuário para vincular:', user);

    // Create institution
    const instName = 'Instituição de Teste';
    const [instRes] = await pool.query('INSERT INTO Instituicoes (nome, is_active) VALUES (?, TRUE) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)', [instName]);
    const instId = instRes.insertId || (await pool.query('SELECT id FROM Instituicoes WHERE nome = ?', [instName]))[0][0].id;
    console.log('Instituição criada/obteve id:', instId);

    // Create course
    const courseName = 'Curso de Teste';
    const [courseRes] = await pool.query('INSERT INTO Cursos (nome, instituicao_id, is_active) VALUES (?, ?, TRUE) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)', [courseName, instId]);
    const courseId = courseRes.insertId || (await pool.query('SELECT id FROM Cursos WHERE nome = ? AND instituicao_id = ?', [courseName, instId]))[0][0].id;
    console.log('Curso criado/obteve id:', courseId);

    // Link user
    const [updateRes] = await pool.query('UPDATE Usuarios SET instituicao_id = ?, curso_id = ? WHERE id = ?', [instId, courseId, user.id]);
    console.log('Usuário atualizado, affectedRows:', updateRes.affectedRows);

    // Verify
    const [newUserRows] = await pool.query('SELECT id, nome, instituicao_id, curso_id, anonymized_id FROM Usuarios WHERE id = ?', [user.id]);
    console.log('Usuário após atualização:');
    console.table(newUserRows);

  } catch (err) {
    console.error('Erro no script:', err);
  } finally {
    await pool.end();
  }
}

main();
