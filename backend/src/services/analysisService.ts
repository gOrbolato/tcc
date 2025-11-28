// Importa a função spawn do módulo child_process para executar comandos externos.
import { spawn } from 'child_process';
// Importa o módulo path para lidar com caminhos de arquivos.
import path from 'path';
// Importa a pool de conexões do banco de dados.
import pool from '../config/database';
// Importa o tipo RowDataPacket do mysql2 para tipar os resultados das queries.
import { RowDataPacket } from 'mysql2';

// Interface para os valores de tendência (valor atual e delta em relação ao período anterior).
interface TrendValue {
  value: number;
  delta: number | null;
}

// Interface para o resultado da análise.
interface AnalysisResult {
  suggestions: any[];
  averages_by_question: any;
  analysis_by_question: any;
  total_evaluations: TrendValue;
  average_media_final: TrendValue;
  score_distribution: any;
  executive_summary: string;
  raw_data: any[];
}

// Interface para as opções de análise (períodos e curso).
interface AnalysisOptions {
  currentStart?: string;
  currentEnd?: string;
  previousStart?: string;
  previousEnd?: string;
  courseId?: string;
}

/**
 * @function generatePdfReport
 * @description Gera um relatório em PDF a partir dos dados de análise de uma instituição.
 * @param {number} institutionId - O ID da instituição.
 * @param {AnalysisOptions} [options={}] - As opções para a geração da análise.
 * @returns {Promise<Buffer>} - Uma promessa que resolve para o buffer do PDF gerado.
 */
export const generatePdfReport = async (
  institutionId: number,
  options: AnalysisOptions = {}
): Promise<Buffer> => {
  // Gera os dados da análise primeiro.
  const reportData = await generateAnalysisForInstitution(institutionId, options);

  // Executa o script Python para gerar o PDF.
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', '..', 'python_scripts', 'generate_pdf.py');
    const pythonProcess = spawn('python', [scriptPath]);

    let pdfBuffer = Buffer.alloc(0);
    let errorOutput = '';

    // Envia os dados da análise para o script Python via stdin.
    pythonProcess.stdin.write(JSON.stringify(reportData));
    pythonProcess.stdin.end();

    // Concatena os chunks de dados recebidos do stdout para formar o buffer do PDF.
    pythonProcess.stdout.on('data', (data) => {
      pdfBuffer = Buffer.concat([pdfBuffer, data]);
    });

    // Captura a saída de erro do script.
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Trata o fechamento do processo do script.
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python PDF script exited with code ${code}`);
        console.error(errorOutput);
        return reject(new Error(`Erro ao gerar PDF: ${errorOutput}`));
      }
      if (pdfBuffer.length === 0) {
        return reject(new Error('Script Python não retornou dados de PDF.'));
      }
      resolve(pdfBuffer);
    });

    // Trata erros ao iniciar o processo.
    pythonProcess.on('error', (err) => {
      console.error('Erro ao iniciar o processo Python para PDF:', err);
      reject(new Error(`Falha ao iniciar o gerador de PDF: ${err.message}`));
    });
  });
};

/**
 * @function generateAnalysisForInstitution
 * @description Gera uma análise detalhada para uma instituição, comparando períodos e utilizando um script Python.
 * @param {number} institutionId - O ID da instituição.
 * @param {AnalysisOptions} [options={}] - As opções para a geração da análise.
 * @returns {Promise<AnalysisResult>} - Uma promessa que resolve para o resultado da análise.
 */
export const generateAnalysisForInstitution = async (
  institutionId: number,
  options: AnalysisOptions = {}
): Promise<AnalysisResult> => {
  
  // Função auxiliar para buscar avaliações no banco de dados com base nos filtros.
  const fetchEvaluations = async (startDate?: string, endDate?: string, courseId?: string): Promise<RowDataPacket[]> => {
    let query = 'SELECT * FROM Avaliacoes WHERE instituicao_id = ?';
    const params: (string | number)[] = [institutionId];

    if (startDate && endDate) {
      query += ' AND criado_em BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    if (courseId) {
      query += ' AND curso_id = ?';
      params.push(courseId);
    }
    
    const [evaluations] = await pool.query<RowDataPacket[]>(query, params);
    return evaluations;
  };

  const currentEvaluations = await fetchEvaluations(options.currentStart, options.currentEnd, options.courseId);
  
  // Se não houver avaliações no período atual, retorna um resultado vazio.
  if (currentEvaluations.length === 0) {
    return {
      suggestions: [],
      averages_by_question: {},
      analysis_by_question: {},
      total_evaluations: { value: 0, delta: null },
      average_media_final: { value: 0, delta: null },
      score_distribution: {},
      executive_summary: "Não há dados de avaliação para o período selecionado.",
      raw_data: [],
    };
  }

  const previousEvaluations = await fetchEvaluations(options.previousStart, options.previousEnd, options.courseId);

  // Filtra para manter apenas a avaliação mais recente de cada usuário.
  const filterLatestEvaluationPerUser = (evaluations: RowDataPacket[]): RowDataPacket[] => {
    const latestEvaluationsMap = new Map<number, RowDataPacket>();

    for (const evalItem of evaluations) {
      const userId = evalItem.usuario_id;
      const createdAt = new Date(evalItem.criado_em);

      if (!latestEvaluationsMap.has(userId) || createdAt > new Date(latestEvaluationsMap.get(userId)!.criado_em)) {
        latestEvaluationsMap.set(userId, evalItem);
      }
    }
    return Array.from(latestEvaluationsMap.values());
  };

  const filteredCurrentEvaluations = filterLatestEvaluationPerUser(currentEvaluations);
  const filteredPreviousEvaluations = filterLatestEvaluationPerUser(previousEvaluations);

  const dataForPython = {
    current: filteredCurrentEvaluations,
    previous: filteredPreviousEvaluations,
  };

  // Executa o script Python para análise dos dados.
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', '..', 'python_scripts', 'analyze_evaluations.py');
    const pythonProcess = spawn('python', [scriptPath]);

    let resultJson = '';
    let errorOutput = '';

    // Envia os dados para o script Python via stdin.
    pythonProcess.stdin.write(JSON.stringify(dataForPython));
    pythonProcess.stdin.end();

    // Captura a saída do script.
    pythonProcess.stdout.setEncoding('utf8');
    pythonProcess.stdout.on('data', (data) => {
      resultJson += data;
    });

    // Captura a saída de erro do script.
    pythonProcess.stderr.setEncoding('utf8');
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data;
    });

    // Trata o fechamento do processo do script.
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        console.error(errorOutput);
        return reject(new Error(`Erro ao executar o script de análise: ${errorOutput}`));
      }
      try {
        if (!resultJson) {
          console.error("Python script returned empty stdout.");
          return reject(new Error("Python script returned empty stdout."));
        }
        const result = JSON.parse(resultJson);
        resolve(result);
      } catch (e) {
        console.error('Falha ao parsear o resultado do script Python:', e);
        console.error('Raw output que causou o erro:', resultJson);
        reject(new Error('Falha ao parsear o resultado do script Python.'));
      }
    });
  });
};
