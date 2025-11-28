// Importa os tipos Request e Response do Express para lidar com as requisições e respostas HTTP.
import { Request, Response } from 'express';
// Importa o serviço de instituição e curso para interagir com a lógica de negócio.
import * as institutionCourseService from '../services/institutionCourseService';
// Importa a pool de conexões do banco de dados.
import pool from '../config/database';
// Importa o tipo RowDataPacket do mysql2 para tipar os resultados das queries.
import { RowDataPacket } from 'mysql2';

/**
 * @function getInstitutions
 * @description Busca e retorna uma lista de instituições, opcionalmente filtrada por um termo de busca.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const getInstitutions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    // Chama o serviço para obter todas as instituições.
    const institutions = await institutionCourseService.getAllInstitutions(q as string | undefined);
    res.status(200).json(institutions);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar instituições.', error: error.message });
  }
};

/**
 * @function getCourses
 * @description Busca e retorna uma lista de cursos, opcionalmente filtrada por instituição e termo de busca.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { institutionId, q } = req.query;
    // Chama o serviço para obter os cursos por instituição.
    const courses = await institutionCourseService.getCoursesByInstitution(Number(institutionId) || undefined, q as string | undefined);
    res.status(200).json(courses);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar cursos.', error: error.message });
  }
};

/**
 * @function createInstitution
 * @description Cria uma nova instituição.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const createInstitution = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { nome, latitude, longitude, cidade, estado } = req.body as any;
    if (!nome) return res.status(400).json({ message: 'Nome da instituição é obrigatório.' });
    // Normaliza o nome da instituição.
    const nomeNorm = String(nome).trim().replace(/\s+/g, ' ');
    // Verifica se a instituição já existe.
    const [exists] = await pool.query<RowDataPacket[]>('SELECT id FROM Instituicoes WHERE LOWER(nome) = ?', [nomeNorm.toLowerCase()]);
    if (exists.length > 0) return res.status(409).json({ message: 'Instituição já existe.' });
    // Insere a nova instituição no banco de dados.
    const [result] = await pool.query<any>(
      'INSERT INTO Instituicoes (nome, latitude, longitude, cidade, estado, is_active) VALUES (?, ?, ?, ?, ?, TRUE)',
      [nomeNorm, latitude || null, longitude || null, cidade || null, estado || null]
    );
    const insertId = result.insertId;
    // Busca a instituição recém-criada para retornar na resposta.
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, nome, latitude, longitude, cidade, estado FROM Instituicoes WHERE id = ?', [insertId]);
    return res.status(201).json(rows[0]);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @function updateInstitution
 * @description Atualiza os dados de uma instituição.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const updateInstitution = async (req: Request, res: Response): Promise<void> => {
  try {
    const institutionId = Number(req.params.id);
    const { nome } = req.body;
    // Chama o serviço para atualizar a instituição.
    const updatedInstitution = await institutionCourseService.updateInstitution(institutionId, nome);
    res.status(200).json({ message: 'Instituição atualizada com sucesso!', institution: updatedInstitution });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @function deleteInstitution
 * @description Desativa uma instituição.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const deleteInstitution = async (req: Request, res: Response): Promise<void> => {
  try {
    const institutionId = Number(req.params.id);
    // Chama o serviço para desativar a instituição.
    await institutionCourseService.deleteInstitution(institutionId);
    res.status(200).json({ message: 'Instituição desativada com sucesso!' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @function createCourse
 * @description Cria um novo curso associado a uma instituição.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const createCourse = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { nome, instituicao_id } = req.body as any;
    if (!nome || !instituicao_id) return res.status(400).json({ message: 'Nome do curso e instituicao_id são obrigatórios.' });
    const nomeNorm = String(nome).trim().replace(/\s+/g, ' ');
    // Verifica se o curso já existe para a instituição.
    const [exists] = await pool.query<RowDataPacket[]>('SELECT id FROM Cursos WHERE LOWER(nome) = ? AND instituicao_id = ?', [nomeNorm.toLowerCase(), instituicao_id]);
    if (exists.length > 0) return res.status(409).json({ message: 'Curso já existe para essa instituição.' });
    // Insere o novo curso no banco de dados.
    const [result] = await pool.query<any>('INSERT INTO Cursos (nome, instituicao_id, is_active) VALUES (?, ?, TRUE)', [nomeNorm, instituicao_id]);
    const insertId = result.insertId;
    // Busca o curso recém-criado para retornar na resposta.
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, nome, instituicao_id FROM Cursos WHERE id = ?', [insertId]);
    return res.status(201).json(rows[0]);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @function updateCourse
 * @description Atualiza os dados de um curso.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = Number(req.params.id);
    const { nome } = req.body;
    // Chama o serviço para atualizar o curso.
    const updatedCourse = await institutionCourseService.updateCourse(courseId, nome);
    res.status(200).json({ message: 'Curso atualizado com sucesso!', course: updatedCourse });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @function deleteCourse
 * @description Desativa um curso.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = Number(req.params.id);
    // Chama o serviço para desativar o curso.
    await institutionCourseService.deleteCourse(courseId);
    res.status(200).json({ message: 'Curso desativado com sucesso!' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @function getCoursesByInstitution
 * @description Busca e retorna todos os cursos de uma determinada instituição.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<void>}
 */
export const getCoursesByInstitution = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Chama o serviço para obter os cursos da instituição.
    const courses = await institutionCourseService.getCoursesByInstitution(Number(id));
    res.status(200).json(courses);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar cursos da instituição.', error: error.message });
  }
};

/**
 * @function getInstitutionsNearby
 * @description Busca e retorna instituições próximas a uma dada localização.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const getInstitutionsNearby = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { lat, lon, radius = 100 } = req.query; // Raio padrão de 100km
    if (!lat || !lon) {
      return res.status(400).json({ message: 'Latitude e longitude são obrigatórias.' });
    }
    // Chama o serviço para obter as instituições próximas.
    const nearbyInstitutions = await institutionCourseService.getInstitutionsNearby(Number(lat), Number(lon), Number(radius));
    return res.status(200).json(nearbyInstitutions);
  } catch (error: any) {
    return res.status(500).json({ message: 'Erro ao buscar instituições próximas.', error: error.message });
  }
};

/**
 * @function mergeInstitution
 * @description Mescla uma instituição de origem em uma instituição de destino.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const mergeInstitution = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { sourceId, destinationId } = req.body;
    if (!sourceId || !destinationId) {
      return res.status(400).json({ message: 'IDs de origem e destino são obrigatórios.' });
    }
    // Chama o serviço para mesclar as instituições.
    await institutionCourseService.mergeInstitution(Number(sourceId), Number(destinationId));
    return res.status(200).json({ message: 'Instituições mescladas com sucesso!' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Erro ao mesclar instituições.', error: error.message });
  }
};

/**
 * @function mergeCourse
 * @description Mescla um curso de origem em um curso de destino.
 * @param {Request} req - O objeto de requisição do Express.
 * @param {Response} res - O objeto de resposta do Express.
 * @returns {Promise<Response>}
 */
export const mergeCourse = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { sourceId, destinationId } = req.body;
    if (!sourceId || !destinationId) {
      return res.status(400).json({ message: 'IDs de origem e destino são obrigatórios.' });
    }
    // Chama o serviço para mesclar os cursos.
    await institutionCourseService.mergeCourse(Number(sourceId), Number(destinationId));
    return res.status(200).json({ message: 'Cursos mesclados com sucesso!' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Erro ao mesclar cursos.', error: error.message });
  }
};
