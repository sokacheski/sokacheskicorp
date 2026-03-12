import Modulo from "../models/Modulos.js";
import Course from "../models/Course.js";
import mongoose from "mongoose";

class ModulosController {
  /*
  |--------------------------------------------------------------------------
  | SEÇÕES DO CURSO (ADMIN)
  |--------------------------------------------------------------------------
  */

  async listSectionsByCourse(req, res) {
    try {
      const { courseId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: "courseId inválido" });
      }

      const sections = await Modulo.find({ course: courseId })
        .sort({ order: 1, createdAt: 1 }) // 👈 ORDENAR POR ORDER PRIMEIRO
        .lean();

      return res.json(sections);
    } catch (error) {
      console.error("❌ Erro listSectionsByCourse:", error);
      return res.status(500).json({
        message: "Erro ao carregar seções",
      });
    }
  }

  async createSection(req, res) {
    try {
      const { courseId } = req.params;
      const { title, layout, published } = req.body || {};

      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: "courseId inválido" });
      }

      if (!title || !title.trim()) {
        return res.status(400).json({
          message: "O título da seção é obrigatório",
        });
      }

      // Contar quantas seções já existem para definir a order
      const sectionsCount = await Modulo.countDocuments({ course: courseId });

      const section = await Modulo.create({
        course: courseId,
        title: title.trim(),
        layout: layout === "horizontal" ? "horizontal" : "vertical",
        published: published ?? false,
        order: sectionsCount, // 👈 NOVO: definir order baseado na quantidade
        items: [],
      });

      return res.status(201).json(section);
    } catch (error) {
      console.error("❌ Erro createSection:", error);
      return res.status(500).json({
        message: "Erro interno ao criar seção",
      });
    }
  }

  async updateSection(req, res) {
    try {
      const { id } = req.params;
      const { title, layout, published } = req.body || {};

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const section = await Modulo.findByIdAndUpdate(
        id,
        {
          ...(title && { title: title.trim() }),
          ...(layout && { layout }),
          ...(typeof published === "boolean" && { published }),
        },
        { new: true }
      );

      if (!section) {
        return res.status(404).json({ message: "Seção não encontrada" });
      }

      return res.json(section);
    } catch (error) {
      console.error("❌ Erro updateSection:", error);
      return res.status(500).json({
        message: "Erro ao atualizar seção",
      });
    }
  }

  async deleteSection(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const deleted = await Modulo.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({ message: "Seção não encontrada" });
      }

      return res.status(204).send();
    } catch (error) {
      console.error("❌ Erro deleteSection:", error);
      return res.status(500).json({
        message: "Erro ao deletar seção",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | REORDENAR SEÇÕES
  |--------------------------------------------------------------------------
  */

  async reorderSections(req, res) {
    try {
      const { orderedIds, courseId } = req.body;

      if (!orderedIds || !Array.isArray(orderedIds) || !courseId) {
        return res.status(400).json({
          message: "orderedIds (array) e courseId são obrigatórios",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: "courseId inválido" });
      }

      // Verificar se todas as seções pertencem ao curso
      const sections = await Modulo.find({ 
        _id: { $in: orderedIds },
        course: courseId 
      });

      if (sections.length !== orderedIds.length) {
        return res.status(400).json({
          message: "Uma ou mais seções não pertencem a este curso",
        });
      }

      // Atualizar a ordem de cada seção
      const updatePromises = orderedIds.map((id, index) => 
        Modulo.findByIdAndUpdate(id, { order: index }, { new: true })
      );

      await Promise.all(updatePromises);

      return res.json({ 
        message: "Ordem das seções atualizada com sucesso",
        count: orderedIds.length 
      });
    } catch (error) {
      console.error("❌ Erro reorderSections:", error);
      return res.status(500).json({
        message: "Erro ao reordenar seções",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | MÓDULOS (ADMIN)
  |--------------------------------------------------------------------------
  */

  async listModulesBySection(req, res) {
    try {
      const { sectionId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        return res.status(400).json({ message: "sectionId inválido" });
      }

      const section = await Modulo.findById(sectionId).lean();

      if (!section) {
        return res.status(404).json({ message: "Seção não encontrada" });
      }

      // Ordenar os módulos por order
      const sortedItems = (section.items || []).sort((a, b) => (a.order || 0) - (b.order || 0));

      return res.json(sortedItems);
    } catch (error) {
      console.error("❌ Erro listModulesBySection:", error);
      return res.status(500).json({
        message: "Erro ao listar módulos",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CREATE MODULE
  |--------------------------------------------------------------------------
  */

  async createModule(req, res) {
    try {
      const { sectionId } = req.params;
      const { title, image, published } = req.body || {};

      if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        return res.status(400).json({ message: "sectionId inválido" });
      }

      if (!title || !title.trim()) {
        return res.status(400).json({
          message: "O título do módulo é obrigatório",
        });
      }

      const section = await Modulo.findById(sectionId);

      if (!section) {
        return res.status(404).json({ message: "Seção não encontrada" });
      }

      const newModule = {
        title: title.trim(),
        image: image || null,
        published: typeof published === "boolean" ? published : false,
        order: section.items.length, // 👈 NOVO: definir order baseado na quantidade
      };

      section.items.push(newModule);
      await section.save();

      return res.status(201).json(
        section.items[section.items.length - 1]
      );
    } catch (error) {
      console.error("❌ Erro createModule:", error);
      return res.status(500).json({
        message: "Erro ao criar módulo",
      });
    }
  }

  async updateModule(req, res) {
    try {
      const { id } = req.params;
      const { title, image, published } = req.body || {};

      const section = await Modulo.findOne({ "items._id": id });

      if (!section) {
        return res.status(404).json({ message: "Módulo não encontrado" });
      }

      const module = section.items.id(id);

      if (title) module.title = title.trim();
      if (image !== undefined) module.image = image;
      if (typeof published === "boolean") module.published = published;

      await section.save();

      return res.json(module);
    } catch (error) {
      console.error("❌ Erro updateModule:", error);
      return res.status(500).json({
        message: "Erro ao atualizar módulo",
      });
    }
  }

  async deleteModule(req, res) {
    try {
      const { id } = req.params;

      const section = await Modulo.findOne({ "items._id": id });

      if (!section) {
        return res.status(404).json({ message: "Módulo não encontrado" });
      }

      section.items.pull(id);
      await section.save();

      return res.status(204).send();
    } catch (error) {
      console.error("❌ Erro deleteModule:", error);
      return res.status(500).json({
        message: "Erro ao deletar módulo",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | REORDENAR MÓDULOS
  |--------------------------------------------------------------------------
  */

  async reorderModules(req, res) {
    try {
      const { orderedIds, sectionId } = req.body;

      if (!orderedIds || !Array.isArray(orderedIds) || !sectionId) {
        return res.status(400).json({
          message: "orderedIds (array) e sectionId são obrigatórios",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        return res.status(400).json({ message: "sectionId inválido" });
      }

      const section = await Modulo.findById(sectionId);

      if (!section) {
        return res.status(404).json({ message: "Seção não encontrada" });
      }

      // Verificar se todos os módulos existem na seção
      const moduleIds = section.items.map(item => item._id.toString());
      const allExist = orderedIds.every(id => moduleIds.includes(id));

      if (!allExist) {
        return res.status(400).json({
          message: "Um ou mais módulos não pertencem a esta seção",
        });
      }

      // Reordenar os módulos
      const itemsMap = {};
      section.items.forEach(item => {
        itemsMap[item._id] = item;
      });

      const reorderedItems = orderedIds.map((id, index) => {
        const item = itemsMap[id];
        item.order = index;
        return item;
      });

      section.items = reorderedItems;
      await section.save();

      return res.json({ 
        message: "Ordem dos módulos atualizada com sucesso",
        count: orderedIds.length 
      });
    } catch (error) {
      console.error("❌ Erro reorderModules:", error);
      return res.status(500).json({
        message: "Erro ao reordenar módulos",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CURSO COMPLETO (ÁREA DE MEMBROS)
  |--------------------------------------------------------------------------
  */

  async getFullCourse(req, res) {
    try {
      const { courseId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: "courseId inválido" });
      }

      const course = await Course.findById(courseId)
        .select("_id title")
        .lean();

      if (!course) {
        return res.status(404).json({ message: "Curso não encontrado" });
      }

      const sections = await Modulo.find({
        course: courseId,
        published: true,
      })
        .sort({ order: 1, createdAt: 1 })
        .lean();

      const filteredSections = sections.map((section) => ({
        ...section,
        items: (section.items || [])
          .filter((m) => m.published === true)
          .sort((a, b) => (a.order || 0) - (b.order || 0)),
      }));

      return res.json({
        course,
        sections: filteredSections,
      });
    } catch (error) {
      console.error("❌ Erro getFullCourse:", error);
      return res.status(500).json({
        message: "Erro ao carregar curso completo",
      });
    }
  }
}

export default new ModulosController();