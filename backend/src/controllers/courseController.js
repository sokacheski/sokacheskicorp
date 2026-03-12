import Course from "../models/Course.js";

/* ================= CREATE ================= */

export async function createCourse(req, res) {
  try {
    const {
      section,
      title,
      image,
      salesUrl,
      isPaid,
      releaseDays,
      published,
      order,
    } = req.body;

    if (!section || !title) {
      return res.status(400).json({
        error: "Seção e título são obrigatórios",
      });
    }

    const course = await Course.create({
      section,
      title,
      image: image || null,
      salesUrl: salesUrl || null,
      isPaid: !!isPaid,
      releaseDays: releaseDays || 0,
      published: published ?? false,
      order: order ?? 0,
    });

    return res.status(201).json(course);
  } catch (err) {
    console.error("Erro ao criar curso:", err);
    return res.status(500).json({ error: "Erro ao criar curso" });
  }
}

/* ================= LIST BY SECTION ================= */

export async function listCoursesBySection(req, res) {
  try {
    const { sectionId } = req.params;
    const { published, onlyAvailable } = req.query;

    const filter = {
      section: sectionId,
    };

    if (published !== undefined) {
      filter.published = published === "true";
    }

    if (onlyAvailable === "true") {
      filter.published = true;

      const now = new Date();

      filter.$expr = {
        $lte: [
          {
            $add: [
              "$createdAt",
              { $multiply: ["$releaseDays", 24 * 60 * 60 * 1000] },
            ],
          },
          now,
        ],
      };
    }

    const courses = await Course.find(filter).sort({
      order: 1,
      createdAt: 1,
    });

    return res.json(courses);
  } catch (err) {
    console.error("Erro ao listar cursos:", err);
    return res.status(500).json({ error: "Erro ao listar cursos" });
  }
}

/* ================= UPDATE FULL ================= */
/**
 * PUT /courses/:id
 * Atualiza dados gerais do curso
 */

export async function updateCourse(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      image,
      salesUrl,
      isPaid,
      releaseDays,
      order, // 👈 ADICIONADO
    } = req.body;

    const updateData = {};

    if (title !== undefined) updateData.title = title.trim();
    if (image !== undefined) updateData.image = image;
    if (salesUrl !== undefined) updateData.salesUrl = salesUrl;
    if (isPaid !== undefined) updateData.isPaid = !!isPaid;
    if (releaseDays !== undefined) updateData.releaseDays = releaseDays;
    if (order !== undefined) updateData.order = order; // 👈 ADICIONADO

    const course = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        error: "Curso não encontrado",
      });
    }

    return res.json(course);
  } catch (err) {
    console.error("Erro ao atualizar curso:", err);
    return res.status(500).json({
      error: "Erro ao atualizar curso",
    });
  }
}

/* ================= UPDATE (PUBLISHED) ================= */

export async function updateCoursePublished(req, res) {
  try {
    const { id } = req.params;
    const { published } = req.body;

    if (typeof published !== "boolean") {
      return res.status(400).json({
        error: "Campo 'published' deve ser boolean",
      });
    }

    const course = await Course.findByIdAndUpdate(
      id,
      { published },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        error: "Curso não encontrado",
      });
    }

    return res.json(course);
  } catch (err) {
    console.error("Erro ao atualizar status do curso:", err);
    return res.status(500).json({
      error: "Erro interno ao atualizar status do curso",
    });
  }
}

/* ================= DELETE ================= */

export async function deleteCourse(req, res) {
  try {
    await Course.findByIdAndDelete(req.params.id);
    return res.status(204).send();
  } catch (err) {
    console.error("Erro ao deletar curso:", err);
    return res.status(500).json({ error: "Erro ao deletar curso" });
  }
}

/* ================= REORDER COURSES ================= */
/**
 * POST /courses/reorder
 * Reordena múltiplos cursos de uma vez
 */

export async function reorderCourses(req, res) {
  try {
    const { orderedIds, sectionId } = req.body;

    if (!orderedIds || !Array.isArray(orderedIds) || !sectionId) {
      return res.status(400).json({
        error: "orderedIds (array) e sectionId são obrigatórios",
      });
    }

    // Verifica se todos os cursos pertencem à seção
    const courses = await Course.find({ 
      _id: { $in: orderedIds },
      section: sectionId 
    });

    if (courses.length !== orderedIds.length) {
      return res.status(400).json({
        error: "Um ou mais cursos não pertencem a esta seção",
      });
    }

    // Atualiza a ordem de cada curso
    const updatePromises = orderedIds.map((id, index) => 
      Course.findByIdAndUpdate(id, { order: index }, { new: true })
    );

    await Promise.all(updatePromises);

    return res.json({ 
      message: "Ordem atualizada com sucesso",
      count: orderedIds.length 
    });
  } catch (err) {
    console.error("Erro ao reordenar cursos:", err);
    return res.status(500).json({ error: "Erro ao reordenar cursos" });
  }
}