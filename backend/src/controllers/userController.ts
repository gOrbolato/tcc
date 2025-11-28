// Importa os tipos Request e Response do Express para lidar com as requisições e respostas HTTP.
import { Request, Response } from 'express';
// Importa o serviço de usuário para interagir com a lógica de negócio.
import * as userService from '../services/userService';
// Importa o serviço de ações do administrador para registrar logs de auditoria.
import * as adminActionsService from '../services/adminActionsService';

// Define uma interface para requisições autenticadas, que podem conter informações do usuário.
interface AuthenticatedRequest extends Request {
  user?: { id: number; isAdmin?: boolean; };
}

/**
 * @function updateUserAsAdmin
 * @description Atualiza os dados de um usuário pelo administrador.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const updateUserAsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const { instituicao_id, curso_id, is_active } = req.body;

    const dataToUpdate: { [key: string]: any } = {};
    if (instituicao_id !== undefined) dataToUpdate.instituicao_id = instituicao_id;
    if (curso_id !== undefined) dataToUpdate.curso_id = curso_id;
    if (is_active !== undefined) dataToUpdate.is_active = is_active;

    // Chama o serviço para atualizar os detalhes do usuário.
    const updatedUser = await userService.updateUserDetails(userId, dataToUpdate);
    res.status(200).json({ message: 'Usuário atualizado com sucesso!', user: updatedUser });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @function getProfile
 * @description Busca e retorna o perfil do usuário autenticado (seja ele admin ou usuário comum).
 * @param {AuthenticatedRequest} req - O objeto de requisição autenticada do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autorizado.' });
    }
    
    let userProfile;
    // Se for administrador, busca o perfil de admin, senão, de usuário.
    if (req.user.isAdmin) {
      userProfile = await userService.getAdminById(req.user.id);
    } else {
      userProfile = await userService.getUserById(req.user.id);
    }
    return res.status(200).json(userProfile);
  } catch (error: any) {
    console.error("ERRO userController: Erro ao buscar perfil:", error);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * @function updateProfile
 * @description Atualiza o perfil do usuário autenticado.
 * @param {AuthenticatedRequest} req - O objeto de requisição autenticada do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autorizado.' });
    }

    let previousData = null;
    // Se for admin, busca os dados anteriores para auditoria.
    if (req.user.isAdmin) {
      try {
        previousData = await userService.getUserById(req.user.id);
      } catch (e) {
        // Ignora se não conseguir buscar os dados anteriores.
      }
    }

    // Chama o serviço para atualizar o perfil do usuário.
    const updatedProfile = await userService.updateUserProfile(req.user.id, req.body, { allowAdminOverride: !!req.user.isAdmin });

    // Se for admin, registra a ação de atualização.
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
    return res.status(200).json({ message: 'Perfil atualizado com sucesso!', user: updatedProfile });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

/**
 * @function changePassword
 * @description Altera a senha do usuário.
 * @param {AuthenticatedRequest} req - O objeto de requisição autenticada do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Não autorizado.' });
    const { senhaAntiga, novaSenha, targetUserId } = req.body;
    const targetId = targetUserId ? Number(targetUserId) : req.user.id;
    if (!novaSenha) return res.status(400).json({ message: 'Nova senha é obrigatória.' });

    // Se for admin alterando a senha de outro usuário.
    if (req.user.isAdmin && targetUserId) {
      await userService.adminChangePassword(targetId, novaSenha);
    } else {
      // Fluxo normal de alteração de senha.
      if (!senhaAntiga) return res.status(400).json({ message: 'Senha antiga é obrigatória.' });
      await userService.changePassword(targetId, senhaAntiga, novaSenha);
    }
    return res.status(200).json({ message: 'Senha alterada com sucesso.' });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

/**
 * @function trancarCurso
 * @description Tranca o curso do usuário autenticado.
 * @param {AuthenticatedRequest} req - O objeto de requisição autenticada do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const trancarCurso = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Não autorizado.' });
    const { motivo } = req.body;
    if (!motivo) {
      return res.status(400).json({ message: 'O motivo do trancamento é obrigatório.' });
    }
    // Chama o serviço para trancar o curso.
    const updated = await userService.trancarCurso(req.user.id, motivo);
    return res.status(200).json({ message: 'Curso trancado com sucesso.', user: updated });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

/**
 * @function requestDesbloqueio
 * @description Cria uma solicitação de desbloqueio de conta.
 * @param {AuthenticatedRequest} req - O objeto de requisição autenticada do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const requestDesbloqueio = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Não autorizado.' });
    const { motivo } = req.body;
    // Chama o serviço para solicitar o desbloqueio.
    const result = await userService.requestDesbloqueio(req.user.id, motivo);
    return res.status(201).json({ message: 'Pedido de desbloqueio criado.', request: result });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};
