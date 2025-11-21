import { Router } from 'express';
// As funções corretas já estão sendo importadas aqui
import { 
    createInstitution, 
    getInstitutions, 
    updateInstitution, 
    deleteInstitution, 
    createCourse, 
    getCourses, 
    updateCourse, 
    deleteCourse,
    getCoursesByInstitution, // Adicionando a função que faltava
    getInstitutionsNearby,
    mergeInstitution,
    mergeCourse
} from '../controllers/institutionCourseController';
import { authenticate } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

// --- ROTAS PARA INSTITUIÇÕES ---

// Rota pública para listar todas as instituições (usado no formulário de registro)
router.get('/institutions', getInstitutions);
router.get('/institutions/nearby', getInstitutionsNearby);

// Rota pública para listar cursos de uma instituição específica (usado no formulário de registro)
router.get('/institutions/:id/courses', getCoursesByInstitution);

// Rota para criar uma instituição. Pode ser pública para o registro ou protegida.
// Para o caso de uso do registro, vamos deixar pública por enquanto.
router.post('/institutions', createInstitution);

// Rotas de gerenciamento que exigem autenticação de admin
router.put('/institutions/:id', authenticate, isAdmin, updateInstitution);
router.delete('/institutions/:id', authenticate, isAdmin, deleteInstitution);


// --- ROTAS PARA CURSOS ---

// Rota para criar um curso (usado no registro)
router.post('/courses', createCourse);

// Rota para obter todos os cursos (pública)
router.get('/courses', getCourses);

// Rotas de gerenciamento de curso para admins
router.put('/courses/:id', authenticate, isAdmin, updateCourse);
router.delete('/courses/:id', authenticate, isAdmin, deleteCourse);
router.post('/institutions/merge', authenticate, isAdmin, mergeInstitution);
router.post('/courses/merge', authenticate, isAdmin, mergeCourse);


export default router;