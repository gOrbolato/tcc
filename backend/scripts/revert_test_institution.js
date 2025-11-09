/*
  Script para reverter a criação de 'Instituição de Teste' e 'Curso de Teste'.
  - Desvincula Usuários que apontam para essas entidades (set NULL em instituicao_id, curso_id)
  - Remove Cursos com nome 'Curso de Teste' vinculados à Instituição de Teste
  - Remove Instituição com nome 'Instituição de Teste'

  Uso: node scripts/revert_test_institution.js
  Atenção: modifica dados em dev. Revise antes de rodar em produção.
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
    // Find the test institution
    const [instRows] = await pool.query('SELECT id FROM Instituicoes WHERE nome = ?', ['Instituição de Teste']);
    if (!instRows || instRows.length === 0) {
      console.log('Nenhuma Instituição de Teste encontrada. Nada a reverter.');
      return;
    }
    const instId = instRows[0].id;
    console.log('Encontrada Instituição de Teste com id=', instId);

    // Find courses linked to this institution with the test course name
    const [courseRows] = await pool.query('SELECT id FROM Cursos WHERE nome = ? AND instituicao_id = ?', ['Curso de Teste', instId]);
    const courseIds = (courseRows || []).map(r => r.id);
    console.log('Cursos de teste encontrados (ids):', courseIds);

    // Unlink users that reference this institution or these courses
    const [usersToUnlink] = await pool.query('SELECT id FROM Usuarios WHERE instituicao_id = ? OR curso_id IN (?)', [instId, courseIds.length ? courseIds : [0]]);
    console.log('Usuários a desvincular:', usersToUnlink.map(u => u.id));

    if (usersToUnlink.length > 0) {
      await pool.query('UPDATE Usuarios SET instituicao_id = NULL, curso_id = NULL WHERE instituicao_id = ? OR curso_id IN (?)', [instId, courseIds.length ? courseIds : [0]]);
      console.log('Usuários desvinculados.');
    }

    // Delete test courses
    if (courseIds.length > 0) {
      await pool.query('DELETE FROM Cursos WHERE id IN (?)', [courseIds]);
      console.log('Cursos de teste removidos.');
    }

    // Delete test institution
    await pool.query('DELETE FROM Instituicoes WHERE id = ?', [instId]);
    console.log('Instituição de Teste removida.');

  } catch (err) {
    console.error('Erro ao reverter dados de teste:', err);
  } finally {
    await pool.end();
  }
}

main();
