
import { Request, Response } from 'express';
import * as userService from '../services/userService';
import * as adminActionsService from '../services/adminActionsService';

// Interface para adicionar o objeto 'user' que vem do middleware de autenticação
interface AuthenticatedRequest extends Request {
  user?: { id: number; isAdmin?: boolean; };
}

// Função para admin atualizar um usuário
export const updateUserAsAdmin = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { instituicao_id, curso_id, is_active } = req.body;

    const dataToUpdate: { [key: string]: any } = {};
    if (instituicao_id !== undefined) dataToUpdate.instituicao_id = instituicao_id;
    if (curso_id !== undefined) dataToUpdate.curso_id = curso_id;
    if (is_active !== undefined) dataToUpdate.is_active = is_active;

    const updatedUser = await userService.updateUserDetails(userId, dataToUpdate);
    res.status(200).json({ message: 'Usuário atualizado com sucesso!', user: updatedUser });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// --- FUNÇÕES ADICIONADAS PARA CORRIGIR O ERRO ---

// Função para o próprio usuário buscar seu perfil
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autorizado.' });
    }
    console.log("DEBUG userController: Buscando perfil para userId:", req.user.id, "isAdmin:", req.user.isAdmin);
    let userProfile;
    if (req.user.isAdmin) {
      userProfile = await userService.getAdminById(req.user.id);
    } else {
      userProfile = await userService.getUserById(req.user.id);
    }
    res.status(200).json(userProfile);
  } catch (error: any) {
    console.error("ERRO userController: Erro ao buscar perfil:", error);
    res.status(400).json({ message: error.message });
  }
};

// Função para o próprio usuário atualizar seu perfil
export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autorizado.' });
    }
    // If admin is updating their own profile (or someone else's), capture previous data for audit
    let previousData = null;
    if (req.user.isAdmin) {
      try {
        previousData = await userService.getUserById(req.user.id);
      } catch (e) {
        // ignore if cannot fetch
      }
    }

    const updatedProfile = await userService.updateUserProfile(req.user.id, req.body, { allowAdminOverride: !!req.user.isAdmin });

    // Log admin action if admin
    if (req.user.isAdmin) {
      const changes: any = {};
      if (previousData) {
        for (const key of Object.keys(req.body)) {
          const oldVal = (previousData as any)[key];
          const newVal = (req.body as any)[key];
          if (String(oldVal) !== String(newVal)) {
            changes[key] = { from: oldVal, to: newVal };
          }
        }
      }
      await adminActionsService.logAdminAction(req.user.id, 'update_profile', req.user.id, { changes, ip: req.ip });
    }
    res.status(200).json({ message: 'Perfil atualizado com sucesso!', user: updatedProfile });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Não autorizado.' });
    const { senhaAntiga, novaSenha, targetUserId } = req.body;
    const targetId = targetUserId ? Number(targetUserId) : req.user.id;
    if (!novaSenha) return res.status(400).json({ message: 'Nova senha é obrigatória.' });
    if (req.user.isAdmin && targetUserId) {
      // admin changing someone else's password (or own without old password)
      await userService.adminChangePassword(targetId, novaSenha);
    } else {
      // regular flow: must provide old password
      if (!senhaAntiga) return res.status(400).json({ message: 'Senha antiga é obrigatória.' });
      await userService.changePassword(targetId, senhaAntiga, novaSenha);
    }
    res.status(200).json({ message: 'Senha alterada com sucesso.' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const trancarCurso = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Não autorizado.' });
    const { motivo } = req.body;
    if (!motivo) {
      return res.status(400).json({ message: 'O motivo do trancamento é obrigatório.' });
    }
    const updated = await userService.trancarCurso(req.user.id, motivo);
    res.status(200).json({ message: 'Curso trancado com sucesso.', user: updated });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const requestDesbloqueio = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Não autorizado.' });
    const { motivo } = req.body;
    const result = await userService.requestDesbloqueio(req.user.id, motivo);
    res.status(201).json({ message: 'Pedido de desbloqueio criado.', request: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
