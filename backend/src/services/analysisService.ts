import { spawn } from 'child_process';
import path from 'path';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

interface TrendValue {
  value: number;
  delta: number | null;
}

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

interface AnalysisOptions {
  currentStart?: string;
  currentEnd?: string;
  previousStart?: string;
  previousEnd?: string;
  courseId?: string;
}

export const generatePdfReport = async (
  institutionId: number,
  options: AnalysisOptions = {}
): Promise<Buffer> => {
  const reportData = await generateAnalysisForInstitution(institutionId, options);

  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', '..', 'python_scripts', 'generate_pdf.py');
    const pythonProcess = spawn('C:\\Users\\GuilhermeOrbolato\\AppData\\Local\\Programs\\Python\\Python311\\python.exe', [scriptPath]);

    let pdfBuffer = Buffer.alloc(0);
    let errorOutput = '';

    pythonProcess.stdin.write(JSON.stringify(reportData));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
      pdfBuffer = Buffer.concat([pdfBuffer, data]);
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

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

    pythonProcess.on('error', (err) => {
      console.error('Erro ao iniciar o processo Python para PDF:', err);
      reject(new Error(`Falha ao iniciar o gerador de PDF: ${err.message}`));
    });
  });
};

export const generateAnalysisForInstitution = async (
  institutionId: number,
  options: AnalysisOptions = {}
): Promise<AnalysisResult> => {
  
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

  // NEW: Filter to keep only the latest evaluation per user for analysis
  const filterLatestEvaluationPerUser = (evaluations: RowDataPacket[]): RowDataPacket[] => {
    const latestEvaluationsMap = new Map<number, RowDataPacket>(); // Map<userId, latestEvaluation>

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

  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', '..', 'python_scripts', 'analyze_evaluations.py');
    const pythonProcess = spawn('C:\\Users\\GuilhermeOrbolato\\AppData\\Local\\Programs\\Python\\Python311\\python.exe', [scriptPath]);

    let resultJson = '';
    let errorOutput = '';

    pythonProcess.stdin.write(JSON.stringify(dataForPython));
    pythonProcess.stdin.end();

    pythonProcess.stdout.setEncoding('utf8');
    pythonProcess.stdout.on('data', (data) => {
      resultJson += data;
    });

    pythonProcess.stderr.setEncoding('utf8');
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data;
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        console.error(errorOutput);
        return reject(new Error(`Erro ao executar o script de análise: ${errorOutput}`));
      }
      try {
        console.log(`--- DEBUG: Raw Python stdout ---\n${resultJson}`);
        if (!resultJson) {
          console.error("Python script returned empty stdout.");
          return reject(new Error("Python script returned empty stdout."));
        }
        const result = JSON.parse(resultJson);
        console.log(`--- DEBUG: Parsed Python result ---\n${JSON.stringify(result, null, 2)}`);
        resolve(result);
      } catch (e) {
        console.error('Falha ao parsear o resultado do script Python:', e);
        console.error('Raw output que causou o erro:', resultJson);
        reject(new Error('Falha ao parsear o resultado do script Python.'));
      }
    });
  });
};
