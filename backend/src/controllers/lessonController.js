import mongoose from "mongoose";
import Lesson from "../models/Lesson.js";

/* ================= CREATE ================= */

export async function createLesson(req, res) {
  try {
    // Validar se moduleId foi fornecido
    if (!req.body.module) {
      return res.status(400).json({ error: "ID do módulo é obrigatório" });
    }

    // Contar quantas aulas já existem para definir a ordem
    const lessonsCount = await Lesson.countDocuments({ module: req.body.module });

    // Mapear campos do frontend para o modelo do backend
    const lessonData = {
      module: req.body.module,
      title: req.body.title,
      description: req.body.description || "",
      // Converter mediaType: "external_url" -> "external"
      mediaType: req.body.mediaType === "external_url" ? "external" : req.body.mediaType,
      // Usar url como media ou media como base64
      media: req.body.url || req.body.media || "",
      // Usar thumbnail como image
      image: req.body.thumbnail || req.body.image || "",
      published: req.body.published || false,
      order: lessonsCount, // 👈 Definir ordem baseada na quantidade
      // Campos do modal de configuração
      waitDays: req.body.waitDays || 0,
      files: req.body.files || [],
    };

    const lesson = await Lesson.create(lessonData);
    res.status(201).json(lesson);
  } catch (err) {
    console.error("Erro ao criar aula:", err);
    
    // Erro de validação do mongoose
    if (err.name === "ValidationError") {
      return res.status(400).json({ 
        error: "Erro de validação", 
        details: err.message 
      });
    }
    
    // Erro de chave duplicada
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: "Registro duplicado", 
        details: err.message 
      });
    }
    
    res.status(500).json({ error: "Erro ao criar aula" });
  }
}

/* ================= GET BY MODULE (ADMIN) ================= */

export async function getLessonsByModule(req, res) {
  try {
    const { moduleId } = req.params;

    // Validar se moduleId é um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({ error: "ID do módulo inválido" });
    }

    // Buscar aulas
    const lessons = await Lesson.find({
      module: moduleId,
    })
      .sort({ order: 1, createdAt: 1 })
      .populate("module", "title");

    res.json(lessons);
  } catch (err) {
    console.error("Erro ao buscar aulas:", err);
    
    // Erro de cast do mongoose (ID inválido)
    if (err.name === "CastError") {
      return res.status(400).json({ 
        error: "ID do módulo inválido"
      });
    }
    
    res.status(500).json({ 
      error: "Erro ao buscar aulas"
    });
  }
}

/* ================= GET PUBLISHED (MEMBERS) ================= */

export async function getPublishedLessonsByModule(req, res) {
  try {
    const { moduleId } = req.params;

    // Validar se moduleId é um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({ error: "ID do módulo inválido" });
    }

    const lessons = await Lesson.find({
      module: moduleId,
      published: true,
    })
      .sort({ order: 1, createdAt: 1 })
      .populate("module", "title");

    res.json(lessons);
  } catch (err) {
    console.error("Erro ao buscar aulas publicadas:", err);
    
    if (err.name === "CastError") {
      return res.status(400).json({ error: "ID do módulo inválido" });
    }
    
    res.status(500).json({
      error: "Erro ao buscar aulas publicadas",
    });
  }
}

/* ================= GET SINGLE LESSON ================= */

export async function getLessonById(req, res) {
  try {
    const { id } = req.params;

    // Validar se ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID da aula inválido" });
    }

    const lesson = await Lesson.findById(id).populate("module", "title");

    if (!lesson) {
      return res.status(404).json({ error: "Aula não encontrada" });
    }

    // Se for área de membros, verificar se está publicada
    if (req.path.includes("/members/") && !lesson.published) {
      return res.status(403).json({ error: "Aula não disponível" });
    }

    res.json(lesson);
  } catch (err) {
    console.error("Erro ao buscar aula:", err);
    
    if (err.name === "CastError") {
      return res.status(400).json({ error: "ID da aula inválido" });
    }
    
    res.status(500).json({ error: "Erro ao buscar aula" });
  }
}

/* ================= UPDATE ================= */

export async function updateLesson(req, res) {
  try {
    const { id } = req.params;

    // Validar se ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID da aula inválido" });
    }

    // Mapear campos do frontend para o modelo do backend (caso venha do frontend)
    const updateData = { ...req.body };
    
    // Mapear campos se vierem do frontend
    if (updateData.url) {
      updateData.media = updateData.url;
      delete updateData.url;
    }
    
    if (updateData.thumbnail) {
      updateData.image = updateData.thumbnail;
      delete updateData.thumbnail;
    }
    
    if (updateData.mediaType === "external_url") {
      updateData.mediaType = "external";
    }

    const lesson = await Lesson.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!lesson) {
      return res.status(404).json({ error: "Aula não encontrada" });
    }

    res.json(lesson);
  } catch (err) {
    console.error("Erro ao atualizar aula:", err);
    
    if (err.name === "ValidationError") {
      return res.status(400).json({ 
        error: "Erro de validação", 
        details: err.message 
      });
    }
    
    if (err.name === "CastError") {
      return res.status(400).json({ error: "ID da aula inválido" });
    }
    
    res.status(500).json({ error: "Erro ao atualizar aula" });
  }
}

/* ================= DELETE ================= */

export async function deleteLesson(req, res) {
  try {
    const { id } = req.params;

    // Validar se ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID da aula inválido" });
    }

    const lesson = await Lesson.findByIdAndDelete(id);

    if (!lesson) {
      return res.status(404).json({ error: "Aula não encontrada" });
    }

    res.status(204).send(); // 👈 Mudado para 204 No Content
  } catch (err) {
    console.error("Erro ao excluir aula:", err);
    
    if (err.name === "CastError") {
      return res.status(400).json({ error: "ID da aula inválido" });
    }
    
    res.status(500).json({ error: "Erro ao excluir aula" });
  }
}

/* ================= UPDATE ORDER ================= */

export async function updateLessonOrder(req, res) {
  try {
    const { id } = req.params;
    const { order } = req.body;

    // Validar se ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID da aula inválido" });
    }

    // Validar se order é um número
    if (typeof order !== 'number') {
      return res.status(400).json({ error: "Order deve ser um número" });
    }

    const lesson = await Lesson.findByIdAndUpdate(
      id,
      { order },
      { new: true }
    );

    if (!lesson) {
      return res.status(404).json({ error: "Aula não encontrada" });
    }

    res.json(lesson);
  } catch (err) {
    console.error("Erro ao atualizar ordem:", err);
    
    if (err.name === "CastError") {
      return res.status(400).json({ error: "ID da aula inválido" });
    }
    
    res.status(500).json({ error: "Erro ao atualizar ordem" });
  }
}

/* ================= REORDER LESSONS ================= */

export async function reorderLessons(req, res) {
  try {
    const { orderedIds, moduleId } = req.body;

    if (!orderedIds || !Array.isArray(orderedIds) || !moduleId) {
      return res.status(400).json({
        error: "orderedIds (array) e moduleId são obrigatórios",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({ error: "moduleId inválido" });
    }

    // Verificar se todas as aulas pertencem ao módulo
    const lessons = await Lesson.find({ 
      _id: { $in: orderedIds },
      module: moduleId 
    });

    if (lessons.length !== orderedIds.length) {
      return res.status(400).json({
        error: "Uma ou mais aulas não pertencem a este módulo",
      });
    }

    // Atualizar a ordem de cada aula
    const updatePromises = orderedIds.map((id, index) => 
      Lesson.findByIdAndUpdate(id, { order: index }, { new: true })
    );

    await Promise.all(updatePromises);

    return res.json({ 
      message: "Ordem das aulas atualizada com sucesso",
      count: orderedIds.length 
    });
  } catch (err) {
    console.error("Erro ao reordenar aulas:", err);
    return res.status(500).json({ error: "Erro ao reordenar aulas" });
  }
}

/* ================= TOGGLE PUBLISH ================= */

export async function toggleLessonPublish(req, res) {
  try {
    const { id } = req.params;

    // Validar se ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID da aula inválido" });
    }

    const lesson = await Lesson.findById(id);
    
    if (!lesson) {
      return res.status(404).json({ error: "Aula não encontrada" });
    }

    lesson.published = !lesson.published;
    await lesson.save();

    res.json(lesson);
  } catch (err) {
    console.error("Erro ao alterar publicação:", err);
    
    if (err.name === "CastError") {
      return res.status(400).json({ error: "ID da aula inválido" });
    }
    
    res.status(500).json({ error: "Erro ao alterar publicação" });
  }
}

/* ================= UPDATE CONFIG ================= */

export async function updateLessonConfig(req, res) {
  try {
    const { id } = req.params;
    const { description, waitDays, files } = req.body;

    // Validar se ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID da aula inválido" });
    }

    const lesson = await Lesson.findById(id);
    
    if (!lesson) {
      return res.status(404).json({ error: "Aula não encontrada" });
    }

    // Atualizar campos de configuração
    if (description !== undefined) lesson.description = description;
    if (waitDays !== undefined) lesson.waitDays = waitDays;
    if (files !== undefined) lesson.files = files;

    await lesson.save();

    res.json(lesson);
  } catch (err) {
    console.error("Erro ao atualizar configuração:", err);
    
    if (err.name === "CastError") {
      return res.status(400).json({ error: "ID da aula inválido" });
    }
    
    res.status(500).json({ error: "Erro ao atualizar configuração" });
  }
}