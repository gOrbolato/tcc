import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import { spawn } from 'child_process';

export const generateReports = async () => {
  // 1. Obter todas as avaliações
  const [evaluations] = await pool.query<RowDataPacket[]>(
    `SELECT
        a.nota_infraestrutura,
        a.obs_infraestrutura,
        a.nota_material_didatico,
        a.obs_material_didatico,
        a.media_final,
        i.nome AS instituicao_nome,
        c.nome AS curso_nome
    FROM Avaliacoes a
    JOIN Instituicoes i ON a.instituicao_id = i.id
    JOIN Cursos c ON a.curso_id = c.id`
  );

  if (evaluations.length === 0) {
    return { summary: 'Nenhuma avaliação encontrada para gerar relatórios.', details: [] };
  }

  // 2. Chamar o script Python para análise
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', ['./python_scripts/analyze_evaluations.py'], {
      cwd: __dirname + '/../../', // Define o diretório de trabalho para o root do backend
    });

    let pythonOutput = '';
    let pythonError = '';

    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      pythonError += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}: ${pythonError}`);
        return reject(new Error(`Erro na análise Python: ${pythonError}`));
      }
      try {
        const result = JSON.parse(pythonOutput);
        resolve(result);
      } catch (parseError) {
        console.error('Erro ao parsear saída do Python:', parseError);
        reject(new Error('Erro ao processar resultados da análise.'));
      }
    });

    pythonProcess.stdin.write(JSON.stringify(evaluations));
    pythonProcess.stdin.end();
  });
};
