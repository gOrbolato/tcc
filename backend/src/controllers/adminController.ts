import { Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import * as adminService from '../services/adminService';

interface AuthenticatedRequest extends Request {
  user?: { id: number; isAdmin?: boolean; };
}

// Função para gerar e baixar o relatório PDF
export const downloadReport = (req: Request, res: Response) => {
  const scriptPath = path.join(__dirname, '../scripts/generate_report.py');

  // 1. Verifica se o script Python existe
  if (!fs.existsSync(scriptPath)) {
    console.error('Erro Crítico: O script de geração de relatório (generate_report.py) não foi encontrado.');
    return res.status(500).json({
      message: 'Erro interno no servidor. A funcionalidade de relatório não está configurada corretamente.',
    });
  }

  // 2. Tenta executar o script
  const pythonProcess = spawn('py', [scriptPath], {
    cwd: path.join(__dirname, '../../'),
  });

  let stderr = '';
  pythonProcess.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  pythonProcess.on('close', (code) => {
    // 3. Se o código de saída for diferente de 0, houve um erro
    if (code !== 0) {
      console.error('Erro ao executar o script Python para gerar relatório:', stderr);
      return res.status(500).json({
        message: 'Não foi possível gerar o relatório. Verifique se o Python está instalado e se as dependências em `backend/src/scripts/requirements.txt` foram instaladas corretamente.',
        error: stderr,
      });
    }

    const reportPath = path.join(__dirname, '../../reports/relatorio_avaliacoes.pdf');

    // 4. Verifica se o arquivo PDF foi realmente criado
    if (!fs.existsSync(reportPath)) {
      console.error('O script Python executou, mas o arquivo PDF não foi encontrado.');
      return res.status(500).json({ message: 'Erro inesperado ao gerar o arquivo do relatório.' });
    }

    // 5. Envia o arquivo para download
    res.download(reportPath, 'relatorio_avaliacoes.pdf', (err) => {
      if (err) {
        console.error('Erro ao enviar o arquivo PDF para o cliente:', err);
      }
    });
  });

  // Captura erros no spawn do processo (ex: comando 'py' não encontrado)
  pythonProcess.on('error', (error) => {
    console.error('Falha ao iniciar o processo Python:', error);
    res.status(500).json({
      message: 'Erro ao executar o Python. Verifique se o Python está instalado e acessível no PATH do sistema.',
      error: error.message,
    });
  });
};

// Nova função para buscar dados do relatório administrativo
export const getAdminReports = async (req: Request, res: Response) => {
  try {
    const filters = {
      institutionId: req.query.institutionId as string | undefined,
      courseId: req.query.courseId as string | undefined,
    };
    const reportData = await adminService.getAdminReportData(filters);
    res.status(200).json(reportData);
  } catch (error: any) {
    console.error("Erro ao buscar dados do relatório administrativo:", error);
    res.status(500).json({ message: 'Erro ao buscar dados do relatório administrativo.', error: error.message });
  }
};

// Nova função para buscar notificações administrativas
export const getAdminNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await adminService.getPendingNotifications();
    res.status(200).json(notifications);
  } catch (error: any) {
    console.error("Erro ao buscar notificações administrativas:", error);
    res.status(500).json({ message: 'Erro ao buscar notificações administrativas.', error: error.message });
  }
};

export const updateAdminProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autorizado.' });
    }
    const { nome, email } = req.body;
    const updatedAdmin = await adminService.updateAdminProfile(req.user.id, { nome, email });
    res.status(200).json({ message: 'Perfil do admin atualizado com sucesso!', user: updatedAdmin });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};