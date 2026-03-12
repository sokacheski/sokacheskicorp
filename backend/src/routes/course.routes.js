import { Router } from "express";
import {
  createCourse,
  listCoursesBySection,
  deleteCourse,
  updateCoursePublished,
  updateCourse,
  reorderCourses, // 👈 NOVO IMPORT
} from "../controllers/courseController.js";

const router = Router();

router.post("/", createCourse);
router.get("/section/:sectionId", listCoursesBySection);
router.post("/reorder", reorderCourses); // 👈 NOVA ROTA

router.put("/:id", updateCourse);           // edição completa
router.patch("/:id", updateCoursePublished); // só published
router.delete("/:id", deleteCourse);

export default router;