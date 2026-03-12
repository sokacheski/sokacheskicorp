import express from "express";
import sectionController from "../controllers/sectionController.js";

const router = express.Router();

// criar seção (admin)
router.post("/sections", sectionController.create);

// listar seções (admin / membros)
router.get("/sections", sectionController.list);

// edição completa
router.put("/sections/:id", sectionController.update);

// toggle published (admin)
router.patch("/sections/:id", sectionController.updatePublished);

// ✅ DELETE seção
router.delete("/sections/:id", sectionController.delete);

// ✅ NOVO: REORDER seções
router.post("/sections/reorder", sectionController.reorder);

export default router;