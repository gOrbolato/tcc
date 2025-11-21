"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// As funções corretas já estão sendo importadas aqui
const institutionCourseController_1 = require("../controllers/institutionCourseController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const isAdmin_1 = require("../middlewares/isAdmin");
const router = (0, express_1.Router)();
// --- ROTAS PARA INSTITUIÇÕES ---
// Rota pública para listar todas as instituições (usado no formulário de registro)
router.get('/institutions', institutionCourseController_1.getInstitutions);
router.get('/institutions/nearby', institutionCourseController_1.getInstitutionsNearby);
// Rota pública para listar cursos de uma instituição específica (usado no formulário de registro)
router.get('/institutions/:id/courses', institutionCourseController_1.getCoursesByInstitution);
// Rota para criar uma instituição. Pode ser pública para o registro ou protegida.
// Para o caso de uso do registro, vamos deixar pública por enquanto.
router.post('/institutions', institutionCourseController_1.createInstitution);
// Rotas de gerenciamento que exigem autenticação de admin
router.put('/institutions/:id', authMiddleware_1.authenticate, isAdmin_1.isAdmin, institutionCourseController_1.updateInstitution);
router.delete('/institutions/:id', authMiddleware_1.authenticate, isAdmin_1.isAdmin, institutionCourseController_1.deleteInstitution);
// --- ROTAS PARA CURSOS ---
// Rota para criar um curso (usado no registro)
router.post('/courses', institutionCourseController_1.createCourse);
// Rota para obter todos os cursos (pública)
router.get('/courses', institutionCourseController_1.getCourses);
// Rotas de gerenciamento de curso para admins
router.put('/courses/:id', authMiddleware_1.authenticate, isAdmin_1.isAdmin, institutionCourseController_1.updateCourse);
router.delete('/courses/:id', authMiddleware_1.authenticate, isAdmin_1.isAdmin, institutionCourseController_1.deleteCourse);
router.post('/institutions/merge', authMiddleware_1.authenticate, isAdmin_1.isAdmin, institutionCourseController_1.mergeInstitution);
router.post('/courses/merge', authMiddleware_1.authenticate, isAdmin_1.isAdmin, institutionCourseController_1.mergeCourse);
exports.default = router;
