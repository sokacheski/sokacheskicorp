import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiType, FiX } from "react-icons/fi";
import { AlertTriangle } from "lucide-react";
import { api } from "../../services/api";

/* ================= TIPOS ================= */

export type LayoutType = "vertical" | "horizontal";

interface SectionPayload {
  title: string;
  layout: LayoutType;
  published: boolean;
}

interface CreateSectionModalProps {
  open: boolean;
  courseId: string;
  onClose: () => void;
  onCreated?: () => Promise<void> | void;
  initialData?: {
    id: string;
    title: string;
    layout: LayoutType;
    published: boolean;
  };
}

/* ================= COMPONENTE ================= */

export default function CreateSectionModal({
  open,
  courseId,
  onClose,
  onCreated,
  initialData,
}: CreateSectionModalProps) {
  const isEdit = Boolean(initialData);

  const [title, setTitle] = useState("");
  const [layout, setLayout] = useState<LayoutType>("vertical");
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [titleError, setTitleError] = useState(false);

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setTitle(initialData.title);
      setLayout(initialData.layout);
      setPublished(initialData.published);
    } else {
      resetForm();
    }
    
    setTitleError(false);
  }, [open, initialData]);

  if (!open) return null;

  /* ================= HELPERS ================= */

  function resetForm() {
    setTitle("");
    setLayout("vertical");
    setPublished(true);
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    const payload: SectionPayload = {
      title: title.trim(),
      layout,
      published,
    };

    try {
      setLoading(true);

      if (isEdit && initialData) {
        await api.put(`/api/sections/${initialData.id}`, payload);
      } else {
        await api.post(`/api/courses/${courseId}/sections`, payload);
      }

      await onCreated?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar seção:", error);
    } finally {
      setLoading(false);
    }
  }

  /* ================= RENDER ================= */

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Container */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-xl">
          {/* Modal Card */}
          <div className="bg-[#141A26] border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 bg-[#1A212F] border-b border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {isEdit ? "Editar Seção" : "Nova Seção"}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {isEdit ? "Altere as informações da seção" : "Configure a nova seção do curso"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-400 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* TÍTULO */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-300">
                  Título da seção
                </label>

                <div className="relative">
                  <FiType className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (titleError) setTitleError(false);
                    }}
                    placeholder="Ex: Módulo 1 - Introdução"
                    className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#1A212F] border border-gray-700 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                {titleError && (
                  <div className="flex items-center gap-1 text-red-400 text-xs mt-1">
                    <AlertTriangle className="w-3 h-3" />
                    Informe um título para a seção
                  </div>
                )}
              </div>

              {/* LAYOUT */}
              <div className="space-y-3">
                <label className="text-sm text-gray-300">
                  Tipo de layout
                </label>

                <div className="grid grid-cols-2 gap-4">
                  {/* VERTICAL */}
                  <button
                    type="button"
                    onClick={() => setLayout("vertical")}
                    className={`
                      rounded-lg border p-4 transition-all duration-200 text-left
                      ${layout === "vertical"
                        ? "border-purple-500/50 bg-purple-500/5 ring-2 ring-purple-500/20" 
                        : "border-gray-700 hover:border-gray-600 bg-[#1A212F]"
                      }
                    `}
                  >
                    <div className="h-20 rounded-lg bg-black/40 grid grid-cols-3 gap-1 p-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded bg-gray-700/50" />
                      ))}
                    </div>
                    <span className="block text-center text-sm text-gray-300 mt-3">
                      Vertical
                    </span>
                  </button>

                  {/* HORIZONTAL */}
                  <button
                    type="button"
                    onClick={() => setLayout("horizontal")}
                    className={`
                      rounded-lg border p-4 transition-all duration-200 text-left
                      ${layout === "horizontal"
                        ? "border-blue-500/50 bg-blue-500/5 ring-2 ring-blue-500/20"
                        : "border-gray-700 hover:border-gray-600 bg-[#1A212F]"
                      }
                    `}
                  >
                    <div className="h-20 rounded-lg bg-black/40 grid grid-cols-2 gap-1 p-1">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="rounded bg-gray-700/50" />
                      ))}
                    </div>
                    <span className="block text-center text-sm text-gray-300 mt-3">
                      Horizontal
                    </span>
                  </button>
                </div>
              </div>

              {/* STATUS */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-300">
                  Status da seção
                </label>

                <select
                  value={published ? "published" : "draft"}
                  onChange={(e) => setPublished(e.target.value === "published")}
                  className="w-full h-11 px-4 rounded-lg bg-[#1A212F] border border-gray-700 text-gray-200 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="published">
                    Publicada (visível para membros)
                  </option>
                  <option value="draft">
                    Rascunho (não visível)
                  </option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-[#1A212F] border-t border-gray-800 flex items-center justify-end gap-4">
              <button
                onClick={onClose}
                className="px-5 h-10 rounded-lg border border-gray-700 text-gray-400 text-sm hover:text-gray-300 hover:border-gray-600 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 h-10 rounded-lg bg-blue-600/90 border border-blue-500/30 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isEdit ? "Salvando..." : "Criando..."}
                  </>
                ) : (
                  isEdit ? "Salvar alterações" : "Criar Seção"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}