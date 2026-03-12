import { Router } from "express";
import ModulosController from "../controllers/modulosController.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| 🔥 CURSO COMPLETO (ÁREA DE MEMBROS)
|--------------------------------------------------------------------------
*/
router.get(
  "/courses/:courseId/full",
  ModulosController.getFullCourse
);

/*
|--------------------------------------------------------------------------
| SEÇÕES INTERNAS DO CURSO (ADMIN)
|--------------------------------------------------------------------------
*/

// listar seções de um curso
router.get(
  "/courses/:courseId/sections",
  ModulosController.listSectionsByCourse
);

// criar seção dentro do curso
router.post(
  "/courses/:courseId/sections",
  ModulosController.createSection
);

// atualizar seção
router.put(
  "/sections/:id",
  ModulosController.updateSection
);

// deletar seção
router.delete(
  "/sections/:id",
  ModulosController.deleteSection
);

// 👈 NOVA ROTA: reordenar seções
router.post(
  "/sections/reorder",
  ModulosController.reorderSections
);

/*
|--------------------------------------------------------------------------
| MÓDULOS DENTRO DA SEÇÃO (ADMIN)
|--------------------------------------------------------------------------
*/

// listar módulos de uma seção
router.get(
  "/sections/:sectionId/modules",
  ModulosController.listModulesBySection
);

// criar módulo dentro da seção
router.post(
  "/sections/:sectionId/modules",
  ModulosController.createModule
);

// atualizar módulo
router.put(
  "/modules/:id",
  ModulosController.updateModule
);

// deletar módulo
router.delete(
  "/modules/:id",
  ModulosController.deleteModule
);

// 👈 NOVA ROTA: reordenar módulos
router.post(
  "/modules/reorder",
  ModulosController.reorderModules
);

export default router;