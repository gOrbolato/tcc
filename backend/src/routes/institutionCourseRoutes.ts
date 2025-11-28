// Importa a função Router do Express para criar um novo objeto de roteador.
import { Router } from 'express';
// Importa os controladores de instituição e curso para lidar com as requisições.
import { 
    createInstitution, 
    getInstitutions, 
    updateInstitution, 
    deleteInstitution, 
    createCourse, 
    getCourses, 
    updateCourse, 
    deleteCourse,
    getCoursesByInstitution,
    getInstitutionsNearby,
    mergeInstitution,
    mergeCourse
} from '../controllers/institutionCourseController';
// Importa o middleware de autenticação para proteger as rotas.
import { authenticate } from '../middlewares/authMiddleware';
// Importa o middleware de verificação de administrador.
import { isAdmin } from '../middlewares/isAdmin';

// Cria um novo objeto de roteador.
const router = Router();

// --- ROTAS PARA INSTITUIÇÕES ---

// Rota pública para listar todas as instituições (usado no formulário de registro).
router.get('/institutions', getInstitutions);

// Rota pública para listar instituições próximas com base na latitude e longitude.
router.get('/institutions/nearby', getInstitutionsNearby);

// Rota pública para listar cursos de uma instituição específica.
router.get('/institutions/:id/courses', getCoursesByInstitution);

// Rota para criar uma nova instituição.
router.post('/institutions', createInstitution);

// Rota para atualizar uma instituição. Requer autenticação de administrador.
router.put('/institutions/:id', authenticate, isAdmin, updateInstitution);

// Rota para deletar (desativar) uma instituição. Requer autenticação de administrador.
router.delete('/institutions/:id', authenticate, isAdmin, deleteInstitution);


// --- ROTAS PARA CURSOS ---

// Rota para criar um novo curso.
router.post('/courses', createCourse);

// Rota pública para obter todos os cursos.
router.get('/courses', getCourses);

// Rota para atualizar um curso. Requer autenticação de administrador.
router.put('/courses/:id', authenticate, isAdmin, updateCourse);

// Rota para deletar (desativar) um curso. Requer autenticação de administrador.
router.delete('/courses/:id', authenticate, isAdmin, deleteCourse);

// Rota para mesclar duas instituições. Requer autenticação de administrador.
router.post('/institutions/merge', authenticate, isAdmin, mergeInstitution);

// Rota para mesclar dois cursos. Requer autenticação de administrador.
router.post('/courses/merge', authenticate, isAdmin, mergeCourse);

// Exporta o roteador para ser usado na aplicação principal.
export default router;