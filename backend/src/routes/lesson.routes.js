import express from "express";
import {
  createLesson,
  getLessonsByModule,
  getPublishedLessonsByModule,
  getLessonById,
  updateLesson,
  deleteLesson,
  updateLessonOrder,
  toggleLessonPublish,
  reorderLessons, // 👈 NOVO
  updateLessonConfig, // 👈 NOVO
} from "../controllers/lessonController.js";

const router = express.Router();

/* ================= ADMIN ROUTES ================= */

// Criar aula
router.post("/lessons", createLesson);

// Listar todas as aulas de um módulo (admin)
router.get("/modules/:moduleId/lessons", getLessonsByModule);

// Buscar uma aula específica (admin)
router.get("/lessons/:id", getLessonById);

// Atualizar aula
router.put("/lessons/:id", updateLesson);

// Deletar aula
router.delete("/lessons/:id", deleteLesson);

// Atualizar ordem da aula
router.patch("/lessons/:id/order", updateLessonOrder);

// Publicar/Despublicar aula
router.patch("/lessons/:id/publish", toggleLessonPublish);

// 👈 NOVA ROTA: Reordenar múltiplas aulas
router.post("/lessons/reorder", reorderLessons);

// 👈 NOVA ROTA: Configurar aula (descrição, waitDays, arquivos)
router.put("/lessons/:id/config", updateLessonConfig);

/* ================= MEMBERS ROUTES ================= */

// Listar apenas aulas publicadas de um módulo
router.get("/members/modules/:moduleId/lessons", getPublishedLessonsByModule);

// Buscar uma aula específica publicada
router.get("/members/lessons/:id", getLessonById);

export default router;