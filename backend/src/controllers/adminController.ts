import { Request, Response } from 'express';
import { exec } from 'child_process';
import path from 'path';
import * as adminService from '../services/adminService';

// Função para gerar e baixar o relatório PDF
export const downloadReport = (req: Request, res: Response) => {
  // ... (código existente) ...
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