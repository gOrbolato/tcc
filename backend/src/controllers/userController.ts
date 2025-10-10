
import { Request, Response } from 'express';
import * as userService from '../services/userService';

// Interface para adicionar o objeto 'user' que vem do middleware de autenticação
interface AuthenticatedRequest extends Request {
  user?: { id: number; isAdmin?: boolean; };
}

// Função para admin atualizar um usuário
export const updateUserAsAdmin = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { instituicao_id, curso_id, is_active } = req.body;
    const updatedUser = await userService.updateUserDetails(userId, { instituicao_id, curso_id, is_active });
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
    const updatedProfile = await userService.updateUserProfile(req.user.id, req.body);
    res.status(200).json({ message: 'Perfil atualizado com sucesso!', user: updatedProfile });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
