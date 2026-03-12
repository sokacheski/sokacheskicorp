import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiPlus,
  FiChevronRight,
  FiGrid,
  FiSettings,
} from "react-icons/fi";

import { api } from "../../services/api";
import CreateLessonModal from "../../modais/lesson/CreateLesson";
import DeleteLessonModal from "../../modais/lesson/deleteLesson";
import ReorderLessonModal from "../../modais/lesson/reorderLesson";
import ConfigLessonModal from "../../modais/lesson/configLesson";

/* ================= TIPOS ================= */

interface Lesson {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  media?: string;
  mediaType?: string;
  createdAt: string;
  published: boolean;
  order?: number;
  module?: {
    _id: string;
    title: string;
  };
}

interface LessonProps {
  module: {
    _id: string;
    title: string;
  };
  onBack: () => void;
}

/* ================= COMPONENTE ================= */

export default function Lesson({ module, onBack }: LessonProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modais
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openReorderModal, setOpenReorderModal] = useState(false);
  
  // Delete
  const [deleteLessonData, setDeleteLessonData] = useState<{ id: string; title: string } | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  
  // Edit
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  
  // Config
  const [configLessonData, setConfigLessonData] = useState<Lesson | null>(null);
  const [openConfigModal, setOpenConfigModal] = useState(false);

  // 👇 EFEITO PARA REMOVER SCROLLBAR
  useEffect(() => {
    // Criar elemento style
    const style = document.createElement('style');
    style.innerHTML = `
      /* Para Webkit (Chrome, Safari, Edge) */
      ::-webkit-scrollbar {
        width: 0px;
        background: transparent;
      }
      
      /* Para Firefox */
      * {
        scrollbar-width: none;
      }
      
      /* Para IE/Edge antigo */
      body {
        -ms-overflow-style: none;
      }
    `;
    
    // Adicionar ao head
    document.head.appendChild(style);
    
    // Cleanup: remover quando componente desmontar
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  /* ================= LOAD ================= */

  useEffect(() => {
    if (!module?._id) return;
    loadLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module?._id]);

  async function loadLessons() {
    try {
      setLoading(true);
      setError("");
      
      const { data } = await api.get(`/modules/${module._id}/lessons`);
      
      if (Array.isArray(data)) {
        setLessons(data);
      } else {
        console.error("Resposta não é um array:", data);
        setError("Formato de dados inválido");
      }
    } catch (error: any) {
      console.error("Erro ao carregar aulas", error);
      
      if (error.response?.status === 404) {
        setError("Rota não encontrada. Verifique se o backend está rodando.");
      } else if (error.response?.status === 500) {
        setError("Erro interno do servidor.");
      } else {
        setError(error.response?.data?.error || "Erro ao carregar aulas");
      }
    } finally {
      setLoading(false);
    }
  }

  /* ================= TOGGLE PUBLICADO ================= */

  async function togglePublished(lesson: Lesson) {
    const newValue = !lesson.published;

    setLessons((prev) =>
      prev.map((l) =>
        l._id === lesson._id ? { ...l, published: newValue } : l
      )
    );

    try {
      await api.patch(`/lessons/${lesson._id}/publish`);
    } catch (error) {
      console.error("Erro ao atualizar aula", error);
      alert("Erro ao atualizar publicação");

      setLessons((prev) =>
        prev.map((l) =>
          l._id === lesson._id
            ? { ...l, published: lesson.published }
            : l
        )
      );
    }
  }

  /* ================= DELETE ================= */

  function handleDeleteLessonClick(lesson: Lesson) {
    setDeleteLessonData({ id: lesson._id, title: lesson.title });
    setOpenDeleteModal(true);
  }

  async function handleDeleteLessonConfirm() {
    if (!deleteLessonData) return;

    try {
      await api.delete(`/lessons/${deleteLessonData.id}`);

      setLessons((prev) =>
        prev.filter((l) => l._id !== deleteLessonData.id)
      );

      setOpenDeleteModal(false);
      setDeleteLessonData(null);
    } catch (error) {
      console.error("Erro ao excluir aula", error);
    }
  }

  /* ================= EDITAR ================= */

  function handleEditLesson(lesson: Lesson) {
    setEditingLesson(lesson);
    setOpenEditModal(true);
  }

  /* ================= CONFIG ================= */

  function handleConfigLesson(lesson: Lesson) {
    setConfigLessonData(lesson);
    setOpenConfigModal(true);
  }

  /* ================= VISUALIZAR AULA ================= */

  function handleViewLesson(lesson: Lesson) {
    window.open(`/member/modulo/${module._id}/aula/${lesson._id}`, '_blank');
  }

  /* ================= FORMATAR DATA ================= */

  function formatDate(dateString: string) {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return "Data inválida";
    }
  }

  /* ================= RENDER ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-gray-500">Carregando aulas...</div>
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
            <span className="text-sm">Voltar para módulos</span>
          </button>
        </div>

        {/* TÍTULO E AÇÕES */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                <span>Módulo</span>
                <FiChevronRight className="h-3 w-3" />
                <span className="text-blue-400">{module?.title}</span>
              </div>
              <h1 className="text-2xl font-semibold text-white">Aulas</h1>
              <p className="mt-1 text-sm text-gray-400">
                Gerencie as aulas deste módulo
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setOpenReorderModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A] focus:ring-blue-500 transition-all duration-200"
              >
                <FiGrid className="mr-2 -ml-1 h-4 w-4" />
                Reordenar Aulas
              </button>

              <button
                onClick={() => setOpenCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A] focus:ring-blue-500 transition-all duration-200"
              >
                <FiPlus className="mr-2 -ml-1 h-4 w-4" />
                Nova Aula
              </button>
            </div>
          </div>
        </div>

        {/* CONTEÚDO */}
        {error ? (
          <div className="bg-[#141A26] border border-red-900/30 rounded-xl p-8 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <div className="bg-[#141A26] border border-gray-800 rounded-xl overflow-hidden">
            {lessons.length === 0 ? (
              <div className="text-center py-16">
                <FiGrid className="mx-auto h-12 w-12 text-gray-600" />
                <h3 className="mt-2 text-sm font-medium text-gray-300">
                  Nenhuma aula
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comece criando uma nova aula para este módulo.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setOpenCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#141A26] focus:ring-blue-500 transition-all duration-200"
                  >
                    <FiPlus className="mr-2 -ml-1 h-4 w-4" />
                    Nova Aula
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* HEADER DA TABELA */}
                <div className="px-8 py-4 bg-[#1A212F] border-b border-gray-800">
                  <div className="grid grid-cols-11 gap-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <div className="col-span-1">ID</div>
                    <div className="col-span-2">Imagem</div>
                    <div className="col-span-2">Nome</div>
                    <div className="col-span-1">Mídia</div>
                    <div className="col-span-1">Criado</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">Visualizar</div>
                    <div className="col-span-2">Ações</div>
                  </div>
                </div>

                {/* LISTA DE AULAS */}
                <div className="divide-y divide-gray-800">
                  {lessons.map((lesson) => (
                    <div
                      key={lesson._id}
                      className="px-8 py-4 hover:bg-[#1A212F] transition-colors duration-200"
                    >
                      <div className="grid grid-cols-11 gap-6 text-sm items-center">
                        {/* ID */}
                        <div className="col-span-1">
                          <span className="font-mono text-xs text-gray-500">
                            {lesson._id.slice(0, 6)}...
                          </span>
                        </div>

                        {/* Imagem */}
                        <div className="col-span-2">
                          {lesson.image ? (
                            <img
                              src={lesson.image}
                              alt={lesson.title}
                              className="w-20 h-12 object-cover rounded bg-gray-800"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-20 h-12 bg-gray-800 rounded" />
                          )}
                        </div>

                        {/* Nome */}
                        <div className="col-span-2">
                          <span className="text-gray-200 font-medium">
                            {lesson.title}
                          </span>
                          {lesson.description && (
                            <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">
                              {lesson.description}
                            </p>
                          )}
                        </div>

                        {/* Mídia */}
                        <div className="col-span-1">
                          {lesson.media ? (
                            <span className={`
                              inline-flex items-center px-2 py-1 rounded text-xs font-medium
                              ${lesson.mediaType === "video" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : ""}
                              ${lesson.mediaType === "pdf" ? "bg-red-500/10 text-red-400 border border-red-500/20" : ""}
                              ${lesson.mediaType === "audio" ? "bg-green-500/10 text-green-400 border border-green-500/20" : ""}
                              ${lesson.mediaType === "external" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : ""}
                            `}>
                              {lesson.mediaType === "video" ? "Vídeo" : 
                               lesson.mediaType === "pdf" ? "PDF" : 
                               lesson.mediaType === "audio" ? "Áudio" : 
                               lesson.mediaType === "external" ? "Link" :
                               "Mídia"}
                            </span>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </div>

                        {/* Criado */}
                        <div className="col-span-1">
                          <span className="text-gray-400 text-xs">
                            {formatDate(lesson.createdAt)}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="col-span-1">
                          <button
                            onClick={() => togglePublished(lesson)}
                            className={`
                              relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none
                              ${lesson.published ? 'bg-blue-600' : 'bg-gray-700'}
                            `}
                          >
                            <span
                              className={`
                                pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg 
                                transition duration-200 ease-in-out
                                ${lesson.published ? 'translate-x-4' : 'translate-x-0'}
                              `}
                            />
                          </button>
                        </div>

                        {/* Visualizar - APENAS ÍCONE */}
                        <div className="col-span-1">
                          <button
                            onClick={() => handleViewLesson(lesson)}
                            className="p-1 text-gray-500 hover:text-blue-400 transition-colors"
                            title="Visualizar aula na área de membros"
                          >
                            <FiEye size={18} />
                          </button>
                        </div>

                        {/* AÇÕES */}
                        <div className="col-span-2 flex items-center gap-3">
                          {/* Botão Editar */}
                          <button
                            onClick={() => handleEditLesson(lesson)}
                            className="p-1 text-gray-500 hover:text-blue-400 transition-colors"
                            title="Editar aula"
                          >
                            <FiEdit2 size={16} />
                          </button>

                          {/* Botão Configurar (Engrenagem) */}
                          <button
                            onClick={() => handleConfigLesson(lesson)}
                            className="p-1 text-gray-500 hover:text-purple-400 transition-colors"
                            title="Configurar aula"
                          >
                            <FiSettings size={16} />
                          </button>

                          {/* Botão Excluir */}
                          <button
                            onClick={() => handleDeleteLessonClick(lesson)}
                            className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                            title="Excluir aula"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAIS */}

      {/* Modal de Criar Aula */}
      <CreateLessonModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreated={loadLessons}
        moduleId={module._id}
      />

      {/* Modal de Editar Aula */}
      {editingLesson && (
        <CreateLessonModal
          open={openEditModal}
          onClose={() => {
            setOpenEditModal(false);
            setEditingLesson(null);
          }}
          onCreated={loadLessons}
          moduleId={module._id}
          initialData={{
            id: editingLesson._id,
            title: editingLesson.title,
            mediaType: editingLesson.mediaType || "external",
            url: editingLesson.media || "",
            thumbnail: editingLesson.image,
            published: editingLesson.published
          }}
        />
      )}

      {/* Modal de Excluir Aula */}
      <DeleteLessonModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setDeleteLessonData(null);
        }}
        onConfirm={handleDeleteLessonConfirm}
        lessonTitle={deleteLessonData?.title}
      />

      {/* Modal de Reordenar Aulas */}
      <ReorderLessonModal
        open={openReorderModal}
        onClose={() => setOpenReorderModal(false)}
        onSave={loadLessons}
        moduleId={module._id}
        lessons={lessons.map(lesson => ({
          _id: lesson._id,
          title: lesson.title,
          order: lesson.order,
          module: lesson.module ? { _id: lesson.module._id, title: lesson.module.title } : undefined
        }))}
      />

      {/* Modal de Configurar Aula */}
      {configLessonData && (
        <ConfigLessonModal
          open={openConfigModal}
          onClose={() => {
            setOpenConfigModal(false);
            setConfigLessonData(null);
          }}
          onSaved={loadLessons}
          lesson={configLessonData}
        />
      )}
    </div>
  );
}