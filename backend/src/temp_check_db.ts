import pool from './config/database';

const checkInstitution = async (name: string) => {
  try {
    console.log(`
Verificando a instituição: "${name}"`);
    
    const [institutionRows]: any = await pool.query(
      'SELECT id FROM Instituicoes WHERE nome = ?',
      [name]
    );

    if (institutionRows.length === 0) {
      console.log('  -> Instituição não encontrada no banco de dados.');
      return;
    }

    const institutionId = institutionRows[0].id;
    console.log(`  -> ID da instituição: ${institutionId}`);

    const [evaluationRows]: any = await pool.query(
      'SELECT COUNT(*) as count FROM Avaliacoes WHERE instituicao_id = ?',
      [institutionId]
    );

    const evaluationCount = evaluationRows[0].count;
    console.log(`  -> Número de avaliações encontradas: ${evaluationCount}`);

  } catch (error) {
    console.error(`Erro ao verificar a instituição "${name}":`, error);
  }
};

const runCheck = async () => {
  await checkInstitution('Faculdade de Ciências e Tecnologia - Presidente Prudente');
  await checkInstitution('Faculdade de Tecnologia de Presidente Prudente');
  await pool.end(); // Fecha a conexão com o banco de dados
};

runCheck();
