// Importa os tipos Request e Response do Express para lidar com as requisições e respostas HTTP.
import { Request, Response } from 'express';
// Importa a função spawn do módulo child_process para executar comandos externos.
import { spawn } from 'child_process';
// Importa o módulo path para lidar com caminhos de arquivos.
import path from 'path';
// Importa o módulo fs para interagir com o sistema de arquivos.
import fs from 'fs';
// Importa o serviço de administrador para interagir com a lógica de negócio.
import * as adminService from '../services/adminService';

// Define uma interface para requisições autenticadas, que podem conter informações do usuário.
interface AuthenticatedRequest extends Request {
  user?: { id: number; isAdmin?: boolean; };
}

/**
 * @function downloadReport
 * @description Gera e baixa um relatório em PDF executando um script Python.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Response | void}
 */
export const downloadReport = (req: Request, res: Response): Response | void => {
  // Constrói o caminho para o script Python de geração de relatório.
  const scriptPath = path.join(__dirname, '../scripts/generate_report.py');

  // 1. Verifica se o script Python existe no caminho especificado.
  if (!fs.existsSync(scriptPath)) {
    console.error('Erro Crítico: O script de geração de relatório (generate_report.py) não foi encontrado.');
    return res.status(500).json({
      message: 'Erro interno no servidor. A funcionalidade de relatório não está configurada corretamente.',
    });
  }

  // 2. Tenta executar o script Python.
  const pythonProcess = spawn('py', [scriptPath], {
    cwd: path.join(__dirname, '../../'),
  });

  let stderr = '';
  // Captura a saída de erro do script Python.
  pythonProcess.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  // É acionado quando o processo do script Python é fechado.
  pythonProcess.on('close', (code) => {
    // 3. Se o código de saída for diferente de 0, houve um erro na execução do script.
    if (code !== 0) {
      console.error('Erro ao executar o script Python para gerar relatório:', stderr);
      return res.status(500).json({
        message: 'Não foi possível gerar o relatório. Verifique se o Python está instalado e se as dependências em `backend/src/scripts/requirements.txt` foram instaladas corretamente.',
        error: stderr,
      });
    }

    // Constrói o caminho para o relatório em PDF gerado.
    const reportPath = path.join(__dirname, '../../reports/relatorio_avaliacoes.pdf');

    // 4. Verifica se o arquivo PDF foi realmente criado pelo script.
    if (!fs.existsSync(reportPath)) {
      console.error('O script Python executou, mas o arquivo PDF não foi encontrado.');
      return res.status(500).json({ message: 'Erro inesperado ao gerar o arquivo do relatório.' });
    }

    // 5. Envia o arquivo para download para o cliente.
    res.download(reportPath, 'relatorio_avaliacoes.pdf', (err) => {
      if (err) {
        console.error('Erro ao enviar o arquivo PDF para o cliente:', err);
      }
    });
  });

  // Captura erros no spawn do processo (ex: comando 'py' não encontrado).
  pythonProcess.on('error', (error) => {
    console.error('Falha ao iniciar o processo Python:', error);
    res.status(500).json({
      message: 'Erro ao executar o Python. Verifique se o Python está instalado e acessível no PATH do sistema.',
      error: error.message,
    });
  });
};

/**
 * @function getAdminReports
 * @description Busca dados para relatórios administrativos com base em filtros.
 * @param {Request} req - O objeto de requisição do Express, contendo filtros na query.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const getAdminReports = async (req: Request, res: Response): Promise<void> => {
  try {
    // Coleta filtros da query string da requisição.
    const filters = {
      institutionId: req.query.institutionId as string | undefined,
      courseId: req.query.courseId as string | undefined,
    };
    // Chama o serviço para obter os dados do relatório.
    const reportData = await adminService.getAdminReportData(filters);
    // Retorna os dados do relatório com status 200.
    res.status(200).json(reportData);
  } catch (error: any) {
    // Em caso de erro, loga a falha e retorna uma resposta de erro 500.
    console.error("Erro ao buscar dados do relatório administrativo:", error);
    res.status(500).json({ message: 'Erro ao buscar dados do relatório administrativo.', error: error.message });
  }
};

/**
 * @function getAdminNotifications
 * @description Busca todas as notificações administrativas pendentes.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const getAdminNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    // Chama o serviço para buscar as notificações pendentes.
    const notifications = await adminService.getPendingNotifications();
    // Retorna as notificações com status 200.
    res.status(200).json(notifications);
  } catch (error: any) {
    // Em caso de erro, loga a falha e retorna uma resposta de erro 500.
    console.error("Erro ao buscar notificações administrativas:", error);
    res.status(500).json({ message: 'Erro ao buscar notificações administrativas.', error: error.message });
  }
};

/**
 * @function updateAdminProfile
 * @description Atualiza o perfil (nome e email) de um administrador.
 * @param {AuthenticatedRequest} req - O objeto de requisição autenticada, contendo o ID do usuário.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const updateAdminProfile = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    // Verifica se a requisição contém um usuário autenticado.
    if (!req.user) {
      return res.status(401).json({ message: 'Não autorizado.' });
    }
    // Extrai nome e email do corpo da requisição.
    const { nome, email } = req.body;
    // Chama o serviço para atualizar o perfil do administrador.
    const updatedAdmin = await adminService.updateAdminProfile(req.user.id, { nome, email });
    // Retorna uma mensagem de sucesso com os dados atualizados.
    return res.status(200).json({ message: 'Perfil do admin atualizado com sucesso!', user: updatedAdmin });
  } catch (error: any) {
    // Em caso de erro (ex: validação), retorna uma resposta de erro 400.
    return res.status(400).json({ message: error.message });
  }
};