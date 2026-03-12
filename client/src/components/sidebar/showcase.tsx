import { useEffect, useState } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiLayers,
  FiPlus,
  FiChevronRight,
  FiGrid,
  FiList,
} from "react-icons/fi";

import CreateSectionModal from "../../modais/showcase/CreateSection";
import CreateCourseModal from "../../modais/showcase/CreateCourse";
import DeleteSectionModal from "../../modais/showcase/DeleteSection";
import DeleteCourseModal from "../../modais/showcase/DeleteCourse";
import ReorderCourseModal from "../../modais/showcase/ReorderCourse";
import ReorderSectionModal from "../../modais/showcase/ReorderSection";

import Modulos from "./modulos";

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

interface Course {
  _id: string;
  title: string;
  createdAt: string;
  published: boolean;
  coverImage?: string;
  image?: string;
}

type ViewMode = "showcase" | "modulos";

/* ================= COMPONENTE ================= */

export default function ShowcaseAdmin() {
  const [openCreateSection, setOpenCreateSection] = useState(false);
  const [openCreateCourse, setOpenCreateCourse] = useState(false);

  const [openDeleteSection, setOpenDeleteSection] = useState(false);
  const [openDeleteCourse, setOpenDeleteCourse] = useState(false);
  const [openReorderSection, setOpenReorderSection] = useState(false);
  const [openReorderCourse, setOpenReorderCourse] = useState(false);

  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const [sections, setSections] = useState<Section[]>([]);
  const [coursesBySection, setCoursesBySection] = useState<
    Record<string, Course[]>
  >({});

  const [loading, setLoading] = useState(true);

  // 🔹 navegação interna
  const [viewMode, setViewMode] = useState<ViewMode>("showcase");
  const [activeCourseForModules, setActiveCourseForModules] =
    useState<Course | null>(null);

  /* ================= LOAD ================= */

  useEffect(() => {
    loadSections();
  }, []);

  async function loadSections() {
    try {
      const { data } = await api.get<Section[]>("/sections");
      setSections(data);

      data.forEach((section) => {
        loadCourses(section._id);
      });
    } catch (error) {
      console.error("Erro ao carregar seções", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCourses(sectionId: string) {
    try {
      const { data } = await api.get<Course[]>(
        `/courses/section/${sectionId}`
      );

      setCoursesBySection((prev) => ({
        ...prev,
        [sectionId]: data,
      }));
    } catch (error) {
      console.error("Erro ao carregar cursos", error);
    }
  }

  /* ================= DELETE SECTION ================= */

  async function handleDeleteSection() {
    if (!activeSection) return;

    try {
      await api.delete(`/sections/${activeSection._id}`);

      setOpenDeleteSection(false);
      setActiveSection(null);

      loadSections();
    } catch (error) {
      console.error("Erro ao deletar seção", error);
      alert("Erro ao deletar seção");
    }
  }

  /* ================= DELETE COURSE ================= */

  async function handleDeleteCourse() {
    if (!activeCourse) return;

    try {
      await api.delete(`/courses/${activeCourse._id}`);

      setOpenDeleteCourse(false);
      setActiveCourse(null);

      loadSections();
    } catch (error) {
      console.error("Erro ao deletar curso", error);
      alert("Erro ao deletar curso");
    }
  }


  /* ================= TOGGLES ================= */

  async function toggleCoursePublished(
    sectionId: string,
    course: Course
  ) {
    try {
      await api.patch(`/courses/${course._id}`, {
        published: !course.published,
      });

      setCoursesBySection((prev) => ({
        ...prev,
        [sectionId]: prev[sectionId].map((c) =>
          c._id === course._id
            ? { ...c, published: !c.published }
            : c
        ),
      }));
    } catch {
      alert("Erro ao atualizar status do curso");
    }
  }

  async function toggleSectionPublished(section: Section) {
    try {
      await api.patch(`/sections/${section._id}`, {
        published: !section.published,
      });

      setSections((prev) =>
        prev.map((s) =>
          s._id === section._id
            ? { ...s, published: !s.published }
            : s
        )
      );
    } catch {
      alert("Erro ao atualizar seção");
    }
  }

  /* ================= VIEW SWITCH ================= */

  if (viewMode === "modulos" && activeCourseForModules) {
    return (
      <Modulos
        course={activeCourseForModules}
        onBack={() => {
          setViewMode("showcase");
          setActiveCourseForModules(null);
        }}
      />
    );
  }

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
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">Vitrine</h1>
              <p className="mt-1 text-sm text-gray-400">
                Gerencie as seções e cursos da sua vitrine
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setOpenReorderSection(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A] focus:ring-blue-500 transition-all duration-200"
              >
                <FiGrid className="mr-2 -ml-1 h-4 w-4" />
                Reordenar seções
              </button>

              <button
                onClick={() => {
                  setEditingSection(null);
                  setOpenCreateSection(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A] focus:ring-blue-500 transition-all duration-200"
              >
                <FiPlus className="mr-2 -ml-1 h-4 w-4" />
                Nova seção
              </button>
            </div>
          </div>
        </div>

        {/* SEÇÕES */}
        {sections.length === 0 ? (
          <div className="text-center py-12 bg-[#141A26] rounded-lg border border-gray-800">
            <FiGrid className="mx-auto h-12 w-12 text-gray-600" />
            <h3 className="mt-2 text-sm font-medium text-gray-300">Nenhuma seção</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando uma nova seção para sua vitrine.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => {
              const courses = coursesBySection[section._id] || [];
              const canReorderCourses = courses.length >= 2;

              return (
                <div
                  key={section._id}
                  className="bg-[#141A26] rounded-lg border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors duration-200"
                >
                  {/* CABEÇALHO */}
                  <div className="px-6 py-4 bg-[#1A212F] border-b border-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <h2 className="text-lg font-medium text-white">
                          {section.title}
                        </h2>
                        
                        {/* BADGE DE LAYOUT REFINADO */}
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

                        {canReorderCourses && (
                          <button
                            onClick={() => {
                              setActiveSection(section);
                              setOpenReorderCourse(true);
                            }}
                            className="inline-flex items-center text-xs text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            <FiGrid className="mr-1 h-3 w-3" />
                            Reordenar cursos
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
                          <button
                            onClick={() => {
                              setEditingSection(section);
                              setOpenCreateSection(true);
                            }}
                            className="text-gray-500 hover:text-blue-400 transition-colors"
                            title="Editar seção"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => {
                              setActiveSection(section);
                              setOpenDeleteSection(true);
                            }}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                            title="Excluir seção"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CONTEÚDO */}
                  <div className="p-6">
                    {courses.length === 0 ? (
                      <div className="text-center py-6 border-2 border-dashed border-gray-800 rounded-lg">
                        <p className="text-sm text-gray-500">
                          Nenhum curso nesta seção
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {courses.map((course) => (
                          <div
                            key={course._id}
                            className="flex items-center gap-4 p-3 bg-[#1A212F] rounded-lg hover:bg-[#232B3B] transition-all duration-200 group"
                          >
                            {/* Preview */}
                            <div className="flex-shrink-0">
                              {(course.coverImage || course.image) ? (
                                <img
                                  src={course.coverImage || course.image}
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
                                  {course._id.slice(0, 8)}...
                                </span>
                                <FiChevronRight className="h-3 w-3 text-gray-700" />
                                <h3 className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">
                                  {course.title}
                                </h3>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Criado em {new Date(course.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleCoursePublished(section._id, course)}
                                className={`
                                  relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent 
                                  transition-colors duration-200 ease-in-out focus:outline-none
                                  ${course.published ? 'bg-blue-600' : 'bg-gray-700'}
                                `}
                              >
                                <span
                                  className={`
                                    pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg 
                                    transition duration-200 ease-in-out
                                    ${course.published ? 'translate-x-4' : 'translate-x-0'}
                                  `}
                                />
                              </button>
                            </div>

                            {/* Ações */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setActiveCourseForModules(course);
                                  setViewMode("modulos");
                                }}
                                className="p-1 text-gray-600 hover:text-indigo-400 transition-colors"
                                title="Gerenciar módulos"
                              >
                                <FiLayers className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setActiveCourse(course);
                                  setActiveSectionId(section._id);
                                  setOpenCreateCourse(true);
                                }}
                                className="p-1 text-gray-600 hover:text-blue-400 transition-colors"
                                title="Editar curso"
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setActiveCourse(course);
                                  setOpenDeleteCourse(true);
                                }}
                                className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                                title="Excluir curso"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Botão Criar Curso */}
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => {
                          setActiveCourse(null);
                          setActiveSectionId(section._id);
                          setOpenCreateCourse(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-700 shadow-sm text-xs font-medium rounded text-gray-300 bg-[#1A212F] hover:bg-[#232B3B] hover:text-white hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#141A26] focus:ring-blue-500 transition-all duration-200"
                      >
                        <FiPlus className="mr-1 h-3 w-3" />
                        Adicionar curso
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAIS */}
        <CreateSectionModal
          open={openCreateSection}
          initialData={
            editingSection
              ? {
                  id: editingSection._id,
                  title: editingSection.title,
                  layout: editingSection.layout,
                  published: editingSection.published,
                }
              : undefined
          }
          onClose={() => {
            setOpenCreateSection(false);
            setEditingSection(null);
          }}
          onCreated={loadSections}
        />

        {activeSectionId && (
          <CreateCourseModal
            open={openCreateCourse}
            sectionId={activeSectionId}
            sectionLayout={sections.find(s => s._id === activeSectionId)?.layout || "vertical"}
            initialData={
              activeCourse
                ? {
                    id: activeCourse._id,
                    title: activeCourse.title,
                    image: activeCourse.coverImage || activeCourse.image,
                    salesUrl: "",
                    isPaid: true,
                    releaseDays: 0,
                  }
                : undefined
            }
            onClose={() => {
              setOpenCreateCourse(false);
              setActiveSectionId(null);
              setActiveCourse(null);
            }}
            onCreated={() => activeSectionId && loadCourses(activeSectionId)}
          />
        )}

        <DeleteSectionModal
          open={openDeleteSection}
          onClose={() => {
            setOpenDeleteSection(false);
            setActiveSection(null);
          }}
          onConfirm={handleDeleteSection}
        />

        <DeleteCourseModal
          open={openDeleteCourse}
          onClose={() => {
            setOpenDeleteCourse(false);
            setActiveCourse(null);
          }}
          onConfirm={handleDeleteCourse}
        />

        <ReorderSectionModal
          open={openReorderSection}
          onClose={() => setOpenReorderSection(false)}
          sections={sections}
          onSave={loadSections}
        />

        {/* CORREÇÃO: Adicionando order e section aos cursos */}
        {activeSection && (
          <ReorderCourseModal
            open={openReorderCourse}
            onClose={() => {
              setOpenReorderCourse(false);
              setActiveSection(null);
            }}
            onSave={loadSections}
            sectionId={activeSection._id}
            courses={(coursesBySection[activeSection._id] || []).map(course => ({
              ...course,
              order: 0,
              section: activeSection._id
            }))}
          />
        )}
      </div>
    </div>
  );
}