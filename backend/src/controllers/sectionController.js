import Section from "../models/Section.js";
import Course from "../models/Course.js";
import Modulos from "../models/Modulos.js";
import Lesson from "../models/Lesson.js";

class SectionController {
  /* ================= CREATE ================= */

  async create(req, res) {
    try {
      const { title, layout, published } = req.body;

      if (!title || !layout) {
        return res.status(400).json({
          message: "Título e layout são obrigatórios",
        });
      }

      const section = await Section.create({
        title: title.trim(),
        layout,
        published: published ?? true,
      });

      return res.status(201).json(section);
    } catch (error) {
      console.error("Erro ao criar seção:", error);
      return res.status(500).json({ message: "Erro ao criar seção" });
    }
  }

  /* ================= LIST ================= */

  async list(req, res) {
    try {
      const { published } = req.query;

      const filter = {};

      if (published !== undefined) {
        filter.published = published === "true";
      }

      const sections = await Section.find(filter).sort({
        order: 1,
        createdAt: 1,
      });

      return res.json(sections);
    } catch (error) {
      console.error("Erro ao listar seções:", error);
      return res.status(500).json({ message: "Erro ao listar seções" });
    }
  }

  /* ================= UPDATE FULL ================= */

  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, layout, published } = req.body;

      const updateData = {};

      if (title !== undefined) updateData.title = title.trim();
      if (layout !== undefined) updateData.layout = layout;
      if (published !== undefined) updateData.published = published;

      const section = await Section.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!section) {
        return res.status(404).json({
          message: "Seção não encontrada",
        });
      }

      return res.json(section);
    } catch (error) {
      console.error("Erro ao atualizar seção:", error);
      return res.status(500).json({ message: "Erro ao atualizar seção" });
    }
  }

  /* ================= UPDATE (PUBLISHED) ================= */

  async updatePublished(req, res) {
    try {
      const { id } = req.params;
      const { published } = req.body;

      if (typeof published !== "boolean") {
        return res.status(400).json({
          message: "Campo 'published' deve ser boolean",
        });
      }

      const section = await Section.findByIdAndUpdate(
        id,
        { published },
        { new: true }
      );

      if (!section) {
        return res.status(404).json({
          message: "Seção não encontrada",
        });
      }

      return res.json(section);
    } catch (error) {
      console.error("Erro ao atualizar status da seção:", error);
      return res.status(500).json({
        message: "Erro ao atualizar status da seção",
      });
    }
  }

  /* ================= DELETE (CASCADE) ================= */

  async delete(req, res) {
    try {
      const { id } = req.params;

      const section = await Section.findById(id);

      if (!section) {
        return res.status(404).json({
          message: "Seção não encontrada",
        });
      }

      // 1️⃣ Buscar todos os cursos da seção
      const courses = await Course.find({ sectionId: id });
      const courseIds = courses.map(c => c._id);

      // 2️⃣ Se existirem cursos, buscar e deletar módulos e aulas
      if (courseIds.length > 0) {
        // Buscar todos os módulos dos cursos
        const modules = await Modulos.find({
          courseId: { $in: courseIds }
        });
        const moduleIds = modules.map(m => m._id);

        // 3️⃣ Deletar todas as aulas dos módulos (se existirem módulos)
        if (moduleIds.length > 0) {
          await Lesson.deleteMany({
            moduleId: { $in: moduleIds }
          });
        }

        // 4️⃣ Deletar todos os módulos dos cursos
        await Modulos.deleteMany({
          courseId: { $in: courseIds }
        });

        // 5️⃣ Deletar todos os cursos da seção
        await Course.deleteMany({
          sectionId: id
        });
      }

      // 6️⃣ Deletar a seção
      await Section.findByIdAndDelete(id);

      return res.json({
        message: "Seção e todo o conteúdo vinculado (cursos, módulos e aulas) foram deletados com sucesso",
      });

    } catch (error) {
      console.error("Erro ao deletar seção:", error);
      return res.status(500).json({
        message: "Erro interno ao deletar seção",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /* ================= NOVO: REORDER SECTIONS ================= */
  /**
   * POST /sections/reorder
   * Recebe um array com os IDs das seções na nova ordem
   */

  async reorder(req, res) {
    try {
      const { orderedIds } = req.body;

      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({
          message: "Formato inválido. Envie um array com os IDs das seções."
        });
      }

      // Verifica se todos os IDs existem
      const sections = await Section.find({ _id: { $in: orderedIds } });
      
      if (sections.length !== orderedIds.length) {
        return res.status(400).json({
          message: "Algumas seções não foram encontradas."
        });
      }

      // Atualiza a ordem de cada seção
      const updatePromises = orderedIds.map((id, index) => {
        return Section.findByIdAndUpdate(id, { order: index }, { new: true });
      });

      await Promise.all(updatePromises);

      // Busca todas as seções atualizadas para retornar
      const updatedSections = await Section.find().sort({ order: 1, createdAt: 1 });

      return res.json({
        message: "Ordem das seções atualizada com sucesso",
        sections: updatedSections
      });

    } catch (error) {
      console.error("Erro ao reordenar seções:", error);
      return res.status(500).json({
        message: "Erro interno ao reordenar seções",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default new SectionController();