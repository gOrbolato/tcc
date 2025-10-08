import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import { spawn } from 'child_process';

export const generateReports = async () => {
  const [evaluations] = await pool.query<RowDataPacket[]>(
    `SELECT
        a.nota_infraestrutura, a.obs_infraestrutura, a.nota_material_didatico,
        a.obs_material_didatico, a.media_final, i.nome AS instituicao_nome, c.nome AS curso_nome
    FROM Avaliacoes a
    JOIN Instituicoes i ON a.instituicao_id = i.id
    JOIN Cursos c ON a.curso_id = c.id`
  );

  // Se não houver avaliações, retorna um objeto de relatório padrão imediatamente.
  if (evaluations.length === 0) {
    return {
      average_media_final: 0,
      average_nota_infraestrutura: 0,
      average_nota_material_didatico: 0,
      total_evaluations: 0,
      evaluations_by_institution: {},
      word_cloud: {},
    };
  }

  // Se houver avaliações, prossegue com a análise Python
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', ['./python_scripts/analyze_evaluations.py'], {
      cwd: __dirname + '/../../',
    });

    let pythonOutput = '';
    let pythonError = '';

    pythonProcess.stdout.on('data', (data) => { pythonOutput += data.toString(); });
    pythonProcess.stderr.on('data', (data) => { pythonError += data.toString(); });

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