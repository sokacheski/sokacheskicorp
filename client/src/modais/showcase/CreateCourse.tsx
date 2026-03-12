import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiType, FiLink, FiImage, FiUpload, FiX } from "react-icons/fi";
import { AlertTriangle } from "lucide-react";
import { api } from "../../services/api";

interface CourseInitialData {
  id: string;
  title: string;
  salesUrl?: string;
  isPaid: boolean;
  releaseDays: number;
  image?: string;
}

interface CreateCourseModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  sectionId: string;
  initialData?: CourseInitialData;
  sectionLayout: "horizontal" | "vertical";
}

const MAX_IMAGE_SIZE = 6000 * 1024;

export default function CreateCourseModal({
  open,
  onClose,
  onCreated,
  sectionId,
  initialData,
  sectionLayout,
}: CreateCourseModalProps) {
  const isEdit = Boolean(initialData);

  const [name, setName] = useState("");
  const [salesUrl, setSalesUrl] = useState("");
  const [isPaid, setIsPaid] = useState(true);
  const [releaseDays, setReleaseDays] = useState(0);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Validações
  const [nameError, setNameError] = useState(false);
  const [urlError, setUrlError] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Tamanhos recomendados baseados no layout
  const recommendedSize = sectionLayout === "vertical" 
    ? "436 x 774px" 
    : "698 x 392px";

  /* ================= EFFECTS ================= */

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setName(initialData.title);
      setSalesUrl(initialData.salesUrl || "");
      setIsPaid(initialData.isPaid);
      setReleaseDays(initialData.releaseDays);
      setPreview(initialData.image || null);
      setCoverImage(null);
    } else {
      resetForm();
    }
    
    // Reset erros ao abrir
    setNameError(false);
    setUrlError(false);
    setImageError(false);
  }, [open, initialData]);

  if (!open) return null;

  /* ================= HELPERS ================= */

  function resetForm() {
    setName("");
    setSalesUrl("");
    setIsPaid(true);
    setReleaseDays(0);
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
    // Validações
    let hasError = false;
    
    if (!name.trim()) {
      setNameError(true);
      hasError = true;
    } else {
      setNameError(false);
    }

    if (!salesUrl.trim() && isPaid) {
      setUrlError(true);
      hasError = true;
    } else {
      setUrlError(false);
    }

    if (!isEdit && !coverImage) {
      setImageError(true);
      hasError = true;
      setTimeout(() => setImageError(false), 3000);
    }

    if (hasError) return;

    try {
      setLoading(true);

      let imageBase64: string | undefined;

      if (coverImage) {
        imageBase64 = await compressImage(coverImage);
      }

      const payload = {
        section: sectionId,
        title: name.trim(),
        salesUrl: salesUrl || "",
        isPaid,
        releaseDays,
        ...(imageBase64 && { image: imageBase64 }),
      };

      if (isEdit && initialData) {
        await api.put(`/courses/${initialData.id}`, payload);
      } else {
        await api.post("/courses", {
          ...payload,
          published: true,
          order: 0,
        });
      }

      onCreated?.();
      onClose();
      resetForm();
      
    } catch (err) {
      console.error(err);
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

  return (
    <>
      {/* MODAL */}
      {open && createPortal(
        <div className="fixed inset-0 z-[99999] overflow-y-auto">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Container */}
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl">
              {/* Modal Card */}
              <div className="bg-[#141A26] border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 bg-[#1A212F] border-b border-gray-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {isEdit ? "Editar curso" : "Novo curso"}
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {isEdit ? "Altere as informações do curso" : "Adicione um novo curso à seção"}
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
                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2 space-y-5">
                      {/* Nome */}
                      <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-300">Nome do curso</label>
                        <div className="relative">
                          <FiType className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              if (nameError) setNameError(false);
                            }}
                            placeholder="Ex: Marketing Digital Avançado"
                            className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#1A212F] border border-gray-700 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          />
                        </div>
                        {nameError && (
                          <div className="flex items-center gap-1 text-red-400 text-xs mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            Informe um título para o curso
                          </div>
                        )}
                      </div>

                      {/* URL */}
                      <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-300">URL da página de vendas</label>
                        <div className="relative">
                          <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            value={salesUrl}
                            onChange={(e) => {
                              setSalesUrl(e.target.value);
                              if (urlError) setUrlError(false);
                            }}
                            placeholder="https://"
                            className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#1A212F] border border-gray-700 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          />
                        </div>
                        {urlError && (
                          <div className="flex items-center gap-1 text-red-400 text-xs mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            Informe a URL da página de vendas
                          </div>
                        )}
                      </div>

                      {/* Grid 2 columns */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Tipo */}
                        <div className="flex flex-col gap-1">
                          <label className="text-sm text-gray-300">Tipo</label>
                          <select
                            value={isPaid ? "paid" : "free"}
                            onChange={(e) => setIsPaid(e.target.value === "paid")}
                            className="w-full h-11 px-4 rounded-lg bg-[#1A212F] border border-gray-700 text-gray-200 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          >
                            <option value="paid">Pago</option>
                            <option value="free">Gratuito</option>
                          </select>
                        </div>

                        {/* Dias */}
                        <div className="flex flex-col gap-1">
                          <label className="text-sm text-gray-300">Liberação (dias)</label>
                          <input
                            type="number"
                            min={0}
                            value={releaseDays}
                            onChange={(e) => setReleaseDays(Number(e.target.value))}
                            className="w-full h-11 px-4 rounded-lg bg-[#1A212F] border border-gray-700 text-gray-200 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Upload */}
                    <div>
                      <label className="text-sm text-gray-300">Imagem de capa</label>
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
                          relative mt-2 h-[240px] rounded-lg overflow-hidden cursor-pointer
                          border-2 border-dashed transition-all duration-200
                          ${imageError 
                            ? 'border-red-500/50 bg-red-500/5' 
                            : isDragging 
                              ? 'border-blue-500 bg-blue-500/5' 
                              : 'border-gray-700 hover:border-gray-600 bg-[#1A212F]'
                          }
                        `}
                      >
                        {preview ? (
                          <>
                            <img
                              src={preview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-xs text-gray-300 bg-black/60 px-3 py-1.5 rounded-lg border border-gray-700">
                                Trocar imagem
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                            <FiImage className="w-10 h-10 text-gray-600 mb-3" />
                            
                            <p className="text-sm text-gray-400 mb-2">
                              {isDragging ? 'Solte para enviar' : 'Arraste uma imagem'}
                            </p>
                            
                            <p className="text-xs text-gray-600 mb-4">
                              ou clique para selecionar
                            </p>
                            
                            <div className="border border-gray-700 rounded-lg px-3 py-1.5">
                              <p className="text-xs text-gray-400">
                                {recommendedSize}
                              </p>
                            </div>
                            
                            <p className="text-xs text-gray-700 mt-3">
                              PNG ou JPEG • Máx 6MB
                            </p>

                            <div className="mt-4 px-4 py-2 rounded-lg border border-gray-700 text-gray-400 flex items-center gap-2 hover:border-gray-600 hover:text-gray-300 transition-colors">
                              <FiUpload className="w-4 h-4" />
                              <span className="text-xs">Escolher arquivo</span>
                            </div>
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
                        <div className="flex items-center gap-1 text-red-400 text-xs mt-2">
                          <AlertTriangle className="w-3 h-3" />
                          {!isEdit && !coverImage ? "Adicione uma imagem para o curso" : "A imagem deve ter no máximo 6000KB"}
                        </div>
                      )}
                    </div>
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
                        <span>{isEdit ? "Salvando..." : "Criando..."}</span>
                      </>
                    ) : (
                      <span>{isEdit ? "Salvar alterações" : "Criar curso"}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}