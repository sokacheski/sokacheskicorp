import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiType, FiImage, FiX } from "react-icons/fi";
import { AlertTriangle } from "lucide-react";
import { api } from "../../services/api";


interface CreateModuleModalProps {
  open: boolean;
  sectionId: string;
  sectionLayout: "vertical" | "horizontal";
  onClose: () => void;
  onCreated?: () => Promise<void> | void;
  initialData?: {
    id: string;
    title: string;
    image?: string;
    published?: boolean;
  };
}

const MAX_IMAGE_SIZE = 6000 * 1024;

/* ================= COMPONENTE ================= */

export default function CreateModuleModal({
  open,
  sectionId,
  sectionLayout,
  onClose,
  onCreated,
  initialData,
}: CreateModuleModalProps) {
  const isEdit = Boolean(initialData);

  const [title, setTitle] = useState("");
  const [published, setPublished] = useState(true);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Validações
  const [titleError, setTitleError] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Tamanhos recomendados baseados no layout
  const recommendedSize = sectionLayout === "vertical" 
    ? "436 x 774px" 
    : "698 x 392px";

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setTitle(initialData.title);
      setPublished(initialData.published ?? true);
      setPreview(initialData.image || null);
      setCoverImage(null);
    } else {
      resetForm();
    }
    
    setTitleError(false);
    setImageError(false);
  }, [open, initialData]);

  if (!open) return null;

  /* ================= HELPERS ================= */

  function resetForm() {
    setTitle("");
    setPublished(true);
    setCoverImage(null);
    setPreview(null);
  }

  function validateAndSetImage(file: File) {
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError(true);
      setTimeout(() => setImageError(false), 3000);
      return;
    }

    setImageError(false);
    setCoverImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = () => (img.src = reader.result as string);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const scale = MAX_WIDTH / img.width;

        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject();

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    try {
      setLoading(true);

      let imageBase64: string | undefined;

      if (coverImage) {
        imageBase64 = await compressImage(coverImage);
      }

      const payload: any = {
        title: title.trim(),
        published,
      };

      if (imageBase64) {
        payload.image = imageBase64;
      } else if (isEdit && !coverImage && preview) {
        // Se está editando e não mudou a imagem, mantém a imagem existente
        payload.image = preview;
      }

      if (isEdit && initialData) {
        await api.put(`/api/modules/${initialData.id}`, payload);
      } else {
        await api.post(`/api/sections/${sectionId}/modules`, payload);
      }

      await onCreated?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar módulo:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetImage(file);
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
                  {isEdit ? "Editar Módulo" : "Novo Módulo"}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {isEdit ? "Altere as informações do módulo" : "Adicione um novo módulo à seção"}
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
                  Nome do módulo
                </label>

                <div className="relative">
                  <FiType className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (titleError) setTitleError(false);
                    }}
                    placeholder="Ex: Introdução ao Curso"
                    className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#1A212F] border border-gray-700 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                {titleError && (
                  <div className="flex items-center gap-1 text-red-400 text-xs mt-1">
                    <AlertTriangle className="w-3 h-3" />
                    Informe um nome para o módulo
                  </div>
                )}
              </div>

              {/* STATUS */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-300">
                  Status do módulo
                </label>

                <select
                  value={published ? "published" : "draft"}
                  onChange={(e) => setPublished(e.target.value === "published")}
                  className="w-full h-11 px-4 rounded-lg bg-[#1A212F] border border-gray-700 text-gray-200 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="published">
                    Publicado (visível para membros)
                  </option>
                  <option value="draft">
                    Rascunho (não visível)
                  </option>
                </select>
              </div>

              {/* UPLOAD DE IMAGEM */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-300">
                  Imagem de capa {isEdit ? "(deixe vazio para manter a atual)" : "(opcional)"}
                </label>
                <div
                  onClick={() => {
                    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                    if (input) input.click();
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`
                    relative rounded-lg overflow-hidden cursor-pointer
                    border-2 border-dashed transition-all duration-200
                    ${imageError 
                      ? 'border-red-500/50 bg-red-500/5' 
                      : isDragging 
                        ? 'border-blue-500 bg-blue-500/5' 
                        : 'border-gray-700 hover:border-gray-600 bg-[#1A212F]'
                    }
                    h-[180px] /* 👈 TAMANHO FIXO MENOR */
                  `}
                >
                  {preview ? (
                    <>
                      <div className="w-full h-full flex items-center justify-center p-2">
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain rounded"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs text-gray-300 bg-black/60 px-3 py-1.5 rounded-lg border border-gray-700">
                          {isEdit ? "Clique para alterar" : "Trocar imagem"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                      <FiImage className="w-8 h-8 text-gray-600 mb-2" />
                      
                      <p className="text-sm text-gray-400 mb-1">
                        {isDragging ? 'Solte para enviar' : 'Arraste uma imagem'}
                      </p>
                      
                      <p className="text-xs text-gray-600 mb-2">
                        ou clique para selecionar
                      </p>

                      {/* Preview do tamanho baseado no layout */}
                      <div className={`
                        border border-gray-700 rounded-lg px-3 py-1.5 mb-2
                        ${sectionLayout === "vertical" ? "bg-purple-500/5" : "bg-blue-500/5"}
                      `}>
                        <p className="text-xs text-gray-400">
                          {recommendedSize}
                        </p>
                      </div>
                      
                      <p className="text-xs text-gray-700">
                        PNG ou JPEG • Máx 6MB
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) validateAndSetImage(file);
                    }}
                  />
                </div>
                {imageError && (
                  <div className="flex items-center gap-1 text-red-400 text-xs mt-1">
                    <AlertTriangle className="w-3 h-3" />
                    {coverImage 
                      ? "A imagem não tem o tamanho recomendado" 
                      : "A imagem deve ter no máximo 6000KB"}
                  </div>
                )}
                <p className="text-xs text-gray-600 mt-1">
                  * Imagem opcional. Tamanho recomendado para melhor visualização.
                </p>
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
                  isEdit ? "Salvar alterações" : "Criar Módulo"
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