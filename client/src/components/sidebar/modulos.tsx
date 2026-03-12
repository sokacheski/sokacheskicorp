import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiLayers,
  FiPlus,
  FiChevronRight,
  FiGrid,
  FiList,
  FiBook,
} from "react-icons/fi";

import CreateSectionModal from "../../modais/modulos/CreateSection";
import CreateModuleModal from "../../modais/modulos/CreateModule";
import DeleteSectionModal from "../../modais/modulos/deleteSection";
import DeleteModuleModal from "../../modais/modulos/deleteModule";
import ReorderSectionModal from "../../modais/modulos/reorderSection";
import ReorderModuleModal from "../../modais/modulos/reorderModule";
import Lesson from "./Lesson";
import { api } from "../../services/api";

/* ================= TIPOS ================= */

type LayoutType = "horizontal" | "vertical";

interface Section {
  _id: string;
  title: string;
  layout: LayoutType;
  published: boolean;
  order: number;
}

interface Module {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  published: boolean;
  image?: string;
  order: number;
  section: string;
}

interface ModulosProps {
  course: {
    _id: string;
    title: string;
  };
  onBack: () => void;
}

/* ================= COMPONENTE ================= */

export default function Modulos({ course, onBack }: ModulosProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [modulesBySection, setModulesBySection] = useState<
    Record<string, Module[]>
  >({});
  const [loading, setLoading] = useState(true);

  // Controle de modais - CRIAÇÃO
  const [openCreateSection, setOpenCreateSection] = useState(false);
  const [sectionForNewModule, setSectionForNewModule] = useState<string | null>(null);

  // Controle de modais - EDIÇÃO
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [openEditSection, setOpenEditSection] = useState(false);
  
  const [editingModule, setEditingModule] = useState<{ module: Module; sectionId: string } | null>(null);
  const [openEditModule, setOpenEditModule] = useState(false);

  // Controle de modais - DELETE
  const [deleteSectionData, setDeleteSectionData] = useState<{ id: string; title: string } | null>(null);
  const [openDeleteSection, setOpenDeleteSection] = useState(false);
  
  const [deleteModuleData, setDeleteModuleData] = useState<{ id: string; title: string; sectionId: string } | null>(null);
  const [openDeleteModule, setOpenDeleteModule] = useState(false);

  // Controle de modais - REORDENAR
  const [openReorderSection, setOpenReorderSection] = useState(false);
  const [openReorderModule, setOpenReorderModule] = useState(false);
  const [reorderModuleSectionId, setReorderModuleSectionId] = useState<string | null>(null);

  // ⭐ CONTROLE DA TELA DE AULAS
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  /* ================= LOAD ================= */

  useEffect(() => {
    if (!course?._id) return;
    loadSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?._id]);

  async function loadSections() {
    try {
      setLoading(true);

      const { data } = await api.get<Section[]>(
        `/api/courses/${course._id}/sections`
      );

      const sectionsData = data || [];
      setSections(sectionsData);

      const modulesMap: Record<string, Module[]> = {};

      await Promise.all(
        sectionsData.map(async (section) => {
          try {
            const { data: modules } = await api.get<Module[]>(
              `/api/sections/${section._id}/modules`
            );

            modulesMap[section._id] = modules || [];
          } catch {
            modulesMap[section._id] = [];
          }
        })
      );

      setModulesBySection(modulesMap);
    } catch (error) {
      console.error("Erro ao carregar seções", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadModules(sectionId: string) {
    try {
      const { data } = await api.get<Module[]>(
        `/api/sections/${sectionId}/modules`
      );

      setModulesBySection((prev) => ({
        ...prev,
        [sectionId]: data || [],
      }));
    } catch (error) {
      console.error("Erro ao carregar módulos", error);
    }
  }

  /* ================= TOGGLE SEÇÃO ================= */

  async function toggleSectionPublished(section: Section) {
    const newValue = !section.published;

    setSections((prev) =>
      prev.map((s) =>
        s._id === section._id ? { ...s, published: newValue } : s
      )
    );

    try {
      await api.patch(`/api/sections/${section._id}`, {
        published: newValue,
      });
    } catch (error) {
      console.error("Erro ao atualizar seção", error);
      // Reverter em caso de erro
      setSections((prev) =>
        prev.map((s) =>
          s._id === section._id
            ? { ...s, published: section.published }
            : s
        )
      );
    }
  }

  /* ================= DELETE SEÇÃO ================= */

  function handleDeleteSectionClick(section: Section) {
    setDeleteSectionData({ id: section._id, title: section.title });
    setOpenDeleteSection(true);
  }

  async function handleDeleteSectionConfirm() {
    if (!deleteSectionData) return;

    try {
      await api.delete(`/api/sections/${deleteSectionData.id}`);

      setSections((prev) =>
        prev.filter((s) => s._id !== deleteSectionData.id)
      );

      setModulesBySection((prev) => {
        const copy = { ...prev };
        delete copy[deleteSectionData.id];
        return copy;
      });

      setOpenDeleteSection(false);
      setDeleteSectionData(null);
    } catch (error) {
      console.error("Erro ao excluir seção", error);
    }
  }

  /* ================= TOGGLE MÓDULO ================= */

  async function toggleModulePublished(
    sectionId: string,
    module: Module
  ) {
    const newValue = !module.published;

    setModulesBySection((prev) => ({
      ...prev,
      [sectionId]: (prev[sectionId] || []).map((m) =>
        m._id === module._id
          ? { ...m, published: newValue }
          : m
      ),
    }));

    try {
      await api.patch(`/api/modules/${module._id}`, {
        published: newValue,
      });
    } catch (error) {
      console.error("Erro ao atualizar módulo", error);
      // Reverter em caso de erro
      setModulesBySection((prev) => ({
        ...prev,
        [sectionId]: (prev[sectionId] || []).map((m) =>
          m._id === module._id
            ? { ...m, published: module.published }
            : m
        ),
      }));
    }
  }

  /* ================= DELETE MÓDULO ================= */

  function handleDeleteModuleClick(module: Module, sectionId: string) {
    setDeleteModuleData({ id: module._id, title: module.title, sectionId });
    setOpenDeleteModule(true);
  }

  async function handleDeleteModuleConfirm() {
    if (!deleteModuleData) return;

    try {
      await api.delete(`/api/modules/${deleteModuleData.id}`);

      setModulesBySection((prev) => ({
        ...prev,
        [deleteModuleData.sectionId]: (prev[deleteModuleData.sectionId] || []).filter(
          (m) => m._id !== deleteModuleData.id
        ),
      }));

      setOpenDeleteModule(false);
      setDeleteModuleData(null);
    } catch (error) {
      console.error("Erro ao excluir módulo", error);
    }
  }

  /* ================= SE ESTÁ NA TELA DE AULAS ================= */

  if (selectedModule) {
    return (
      <Lesson
        module={selectedModule}
        onBack={() => setSelectedModule(null)}
      />
    );
  }

  /* ================= RENDER ================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER COM VOLTAR */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <FiArrowLeft size={18} />
            <span className="text-sm">Voltar para vitrine</span>
          </button>
        </div>

        {/* TÍTULO E AÇÕES */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                <span>Curso</span>
                <FiChevronRight className="h-3 w-3" />
                <span className="text-blue-400">{course?.title}</span>
              </div>
              <h1 className="text-2xl font-semibold text-white">Módulos</h1>
              <p className="mt-1 text-sm text-gray-400">
                Gerencie as seções e módulos do curso
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setOpenReorderSection(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A] focus:ring-blue-500 transition-all duration-200"
              >
                <FiGrid className="mr-2 -ml-1 h-4 w-4" />
                Reordenar Seções
              </button>

              <button
                onClick={() => setOpenCreateSection(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A] focus:ring-blue-500 transition-all duration-200"
              >
                <FiPlus className="mr-2 -ml-1 h-4 w-4" />
                Nova Seção
              </button>
            </div>
          </div>
        </div>

        {/* SEÇÕES */}
        {sections.length === 0 ? (
          <div className="text-center py-12 bg-[#141A26] rounded-lg border border-gray-800">
            <FiLayers className="mx-auto h-12 w-12 text-gray-600" />
            <h3 className="mt-2 text-sm font-medium text-gray-300">Nenhuma seção</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando uma nova seção para este curso.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => {
              const modules = modulesBySection[section._id] || [];
              const canReorderModules = modules.length >= 2;

              return (
                <div
                  key={section._id}
                  className="bg-[#141A26] rounded-lg border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors duration-200"
                >
                  {/* CABEÇALHO DA SEÇÃO */}
                  <div className="px-6 py-4 bg-[#1A212F] border-b border-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <h2 className="text-lg font-medium text-white">
                          {section.title}
                        </h2>
                        
                        {/* BADGE DE LAYOUT */}
                        <span className="
                          inline-flex items-center gap-1.5 px-3 py-1 
                          rounded-full text-xs font-medium
                          bg-gradient-to-r from-blue-500/10 to-purple-500/10
                          text-blue-400 border border-blue-500/20
                          shadow-[0_0_10px_rgba(59,130,246,0.1)]
                        ">
                          {section.layout === 'vertical' ? (
                            <>
                              <FiList className="h-3 w-3" />
                              <span>Vertical</span>
                            </>
                          ) : (
                            <>
                              <FiGrid className="h-3 w-3" />
                              <span>Horizontal</span>
                            </>
                          )}
                        </span>

                        {canReorderModules && (
                          <button
                            onClick={() => {
                              setReorderModuleSectionId(section._id);
                              setOpenReorderModule(true);
                            }}
                            className="inline-flex items-center text-xs text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            <FiGrid className="mr-1 h-3 w-3" />
                            Reordenar módulos
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">
                            {section.published ? 'Publicado' : 'Rascunho'}
                          </span>
                          
                          <button
                            onClick={() => toggleSectionPublished(section)}
                            className={`
                              relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 
                              focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1A212F]
                              ${section.published ? 'bg-blue-600' : 'bg-gray-700'}
                            `}
                          >
                            <span
                              className={`
                                pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg 
                                transition duration-200 ease-in-out
                                ${section.published ? 'translate-x-4' : 'translate-x-0'}
                              `}
                            />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* BOTÃO EDITAR SEÇÃO */}
                          <button
                            onClick={() => {
                              setEditingSection(section);
                              setOpenEditSection(true);
                            }}
                            className="text-gray-500 hover:text-blue-400 transition-colors"
                            title="Editar seção"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>

                          {/* BOTÃO EXCLUIR SEÇÃO */}
                          <button
                            onClick={() => handleDeleteSectionClick(section)}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                            title="Excluir seção"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CONTEÚDO - MÓDULOS */}
                  <div className="p-6">
                    {modules.length === 0 ? (
                      <div className="text-center py-6 border-2 border-dashed border-gray-800 rounded-lg">
                        <p className="text-sm text-gray-500">
                          Nenhum módulo nesta seção
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {modules.map((module) => (
                          <div
                            key={module._id}
                            className="flex items-center gap-4 p-3 bg-[#1A212F] rounded-lg hover:bg-[#232B3B] transition-all duration-200 group"
                          >
                            {/* Preview */}
                            <div className="flex-shrink-0">
                              {module.image ? (
                                <img
                                  src={module.image}
                                  alt={module.title}
                                  className={`
                                    rounded object-cover bg-gray-800
                                    ${section.layout === "vertical"
                                      ? "w-12 h-16"
                                      : "w-20 h-12"
                                    }
                                  `}
                                />
                              ) : (
                                <div
                                  className={`
                                    bg-gray-800 rounded
                                    ${section.layout === "vertical"
                                      ? "w-12 h-16"
                                      : "w-20 h-12"
                                    }
                                  `}
                                />
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-gray-600">
                                  {module._id.slice(0, 8)}...
                                </span>
                                <FiChevronRight className="h-3 w-3 text-gray-700" />
                                <h3 className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">
                                  {module.title}
                                </h3>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Criado em {new Date(module.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleModulePublished(section._id, module)}
                                className={`
                                  relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent 
                                  transition-colors duration-200 ease-in-out focus:outline-none
                                  ${module.published ? 'bg-blue-600' : 'bg-gray-700'}
                                `}
                              >
                                <span
                                  className={`
                                    pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg 
                                    transition duration-200 ease-in-out
                                    ${module.published ? 'translate-x-4' : 'translate-x-0'}
                                  `}
                                />
                              </button>
                            </div>

                            {/* Ações */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedModule(module)}
                                className="p-1 text-gray-600 hover:text-emerald-400 transition-colors"
                                title="Gerenciar aulas"
                              >
                                <FiBook className="h-4 w-4" />
                              </button>

                              {/* BOTÃO EDITAR MÓDULO */}
                              <button
                                onClick={() => {
                                  setEditingModule({ module, sectionId: section._id });
                                  setOpenEditModule(true);
                                }}
                                className="p-1 text-gray-600 hover:text-blue-400 transition-colors"
                                title="Editar módulo"
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </button>

                              {/* BOTÃO EXCLUIR MÓDULO */}
                              <button
                                onClick={() => handleDeleteModuleClick(module, section._id)}
                                className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                                title="Excluir módulo"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Botão Criar Módulo */}
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => setSectionForNewModule(section._id)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-700 shadow-sm text-xs font-medium rounded text-gray-300 bg-[#1A212F] hover:bg-[#232B3B] hover:text-white hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#141A26] focus:ring-blue-500 transition-all duration-200"
                      >
                        <FiPlus className="mr-1 h-3 w-3" />
                        Adicionar módulo
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAIS */}

        {/* MODAL DE CRIAÇÃO/EDIÇÃO DE SEÇÃO */}
        <CreateSectionModal
          open={openCreateSection || openEditSection}
          courseId={course._id}
          initialData={editingSection ? {
            id: editingSection._id,
            title: editingSection.title,
            layout: editingSection.layout,
            published: editingSection.published
          } : undefined}
          onClose={() => {
            setOpenCreateSection(false);
            setOpenEditSection(false);
            setEditingSection(null);
          }}
          onCreated={() => {
            loadSections();
            setOpenCreateSection(false);
            setOpenEditSection(false);
            setEditingSection(null);
          }}
        />

        {/* MODAL DE CRIAÇÃO/EDIÇÃO DE MÓDULO */}
        {sectionForNewModule && (
          <CreateModuleModal
            open={!!sectionForNewModule}
            sectionId={sectionForNewModule}
            sectionLayout={sections.find(s => s._id === sectionForNewModule)?.layout || "vertical"}
            onClose={() => setSectionForNewModule(null)}
            onCreated={() => {
              loadModules(sectionForNewModule);
              setSectionForNewModule(null);
            }}
          />
        )}

        {editingModule && (
          <CreateModuleModal
            open={openEditModule}
            sectionId={editingModule.sectionId}
            sectionLayout={sections.find(s => s._id === editingModule.sectionId)?.layout || "vertical"}
            initialData={{
              id: editingModule.module._id,
              title: editingModule.module.title,
              image: editingModule.module.image || "",
              published: editingModule.module.published
            }}
            onClose={() => {
              setOpenEditModule(false);
              setEditingModule(null);
            }}
            onCreated={() => {
              loadModules(editingModule.sectionId);
              setOpenEditModule(false);
              setEditingModule(null);
            }}
          />
        )}

        {/* MODAL DE EXCLUSÃO DE SEÇÃO */}
        <DeleteSectionModal
          open={openDeleteSection}
          onClose={() => {
            setOpenDeleteSection(false);
            setDeleteSectionData(null);
          }}
          onConfirm={handleDeleteSectionConfirm}
          sectionTitle={deleteSectionData?.title}
        />

        {/* MODAL DE EXCLUSÃO DE MÓDULO */}
        <DeleteModuleModal
          open={openDeleteModule}
          onClose={() => {
            setOpenDeleteModule(false);
            setDeleteModuleData(null);
          }}
          onConfirm={handleDeleteModuleConfirm}
          moduleTitle={deleteModuleData?.title}
        />

        {/* MODAL DE REORDENAR SEÇÕES */}
        <ReorderSectionModal
          open={openReorderSection}
          onClose={() => setOpenReorderSection(false)}
          onSave={loadSections}
          courseId={course._id}
          sections={sections}
        />

        {/* MODAL DE REORDENAR MÓDULOS */}
        {reorderModuleSectionId && (
          <ReorderModuleModal
            open={openReorderModule}
            onClose={() => {
              setOpenReorderModule(false);
              setReorderModuleSectionId(null);
            }}
            onSave={() => {
              if (reorderModuleSectionId) {
                loadModules(reorderModuleSectionId);
              }
            }}
            sectionId={reorderModuleSectionId}
            modules={modulesBySection[reorderModuleSectionId] || []}
          />
        )}
      </div>
    </div>
  );
}