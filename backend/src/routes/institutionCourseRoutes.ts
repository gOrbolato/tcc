import { Router } from 'express';
import { createInstitution, getInstitutions, updateInstitution, deleteInstitution, createCourse, getCourses, updateCourse, deleteCourse } from '../controllers/institutionCourseController';
import { authenticate } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

// Rotas para Instituições (requerem privilégios de admin)
router.post('/institutions', authenticate, isAdmin, createInstitution);
router.get('/institutions', authenticate, isAdmin, getInstitutions);
router.put('/institutions/:id', authenticate, isAdmin, updateInstitution);
router.delete('/institutions/:id', authenticate, isAdmin, deleteInstitution);

// Rotas para Cursos (requerem privilégios de admin)
router.post('/courses', authenticate, isAdmin, createCourse);
router.get('/courses', authenticate, isAdmin, getCourses);
router.put('/courses/:id', authenticate, isAdmin, updateCourse);
router.delete('/courses/:id', authenticate, isAdmin, deleteCourse);

// Rotas para listar
router.get('/instituicoes', controller.getAllInstituicoes);
router.get('/instituicoes/:id/cursos', controller.getCursosByInstituicao);

// Rotas para criar (NECESSÁRIAS PARA O REGISTRO)
router.post('/instituicoes', controller.createInstituicao);
router.post('/cursos', controller.createCurso);

export default router;
