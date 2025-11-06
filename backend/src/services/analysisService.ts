import { spawn } from 'child_process';
import path from 'path';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

interface AnalysisResult {
  suggestions: any[];
  averages_by_question: any;
  analysis_by_question: any;
}

export const generateAnalysisForInstitution = async (institutionId: number): Promise<AnalysisResult> => {
  // 1. Buscar todas as avaliações para a instituição
  const [evaluations] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM Avaliacoes WHERE instituicao_id = ?',
    [institutionId]
  );

  if (evaluations.length === 0) {
    return {
      suggestions: [],
      averages_by_question: {},
      analysis_by_question: {},
    };
  }

  // 2. Executar o script Python como um processo filho
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', 'python_scripts', 'analyze_evaluations.py');
    const pythonProcess = spawn('python', [scriptPath]);

    let resultJson = '';
    let errorOutput = '';

    // 3. Enviar os dados das avaliações para o stdin do script
    pythonProcess.stdin.write(JSON.stringify(evaluations));
    pythonProcess.stdin.end();

    // 4. Capturar a saída (stdout) do script
    pythonProcess.stdout.on('data', (data) => {
      resultJson += data.toString();
    });

    // Capturar erros
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // 5. Quando o processo terminar, resolver a Promise com o resultado
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        console.error(errorOutput);
        return reject(new Error(`Erro ao executar o script de análise: ${errorOutput}`));
      }
      try {
        const result = JSON.parse(resultJson);
        resolve(result);
      } catch (e) {
        reject(new Error('Falha ao parsear o resultado do script Python.'));
      }
    });
  });
};
