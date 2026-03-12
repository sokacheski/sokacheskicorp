import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiType,
  FiLink,
  FiImage,
  FiUpload,
  FiX,
  FiVideo,
  FiFileText,
  FiHeadphones,
} from "react-icons/fi";
import { AlertTriangle } from "lucide-react";
import { api } from "../../services/api";

interface CreateLessonModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  moduleId: string;
  initialData?: {
    id: string;
    title: string;
    mediaType: string;
    url: string;
    thumbnail?: string;
    published?: boolean;
  };
}

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_PDF_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB

export default function CreateLessonModal({
  open,
  onClose,
  onCreated,
  moduleId,
  initialData,
}: CreateLessonModalProps) {
  const isEdit = Boolean(initialData);

  const [title, setTitle] = useState("");
  const [mediaType, setMediaType] = useState("external_url");
  const [url, setUrl] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaFileName, setMediaFileName] = useState("");
  const [published, setPublished] = useState(true);

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMediaDragging, setIsMediaDragging] = useState(false);

  // Validações
  const [titleError, setTitleError] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setTitle(initialData.title);
      setMediaType(initialData.mediaType);
      setUrl(initialData.url);
      setPublished(initialData.published ?? true);
      setPreview(initialData.thumbnail || null);
      setThumbnail(null);
      setMediaFile(null);
      setMediaFileName("");
    } else {
      resetForm();
    }

    setTitleError(false);
    setMediaError(false);
    setImageError(false);
  }, [open, initialData]);

  if (!open) return null;

  function resetForm() {
    setTitle("");
    setMediaType("external_url");
    setUrl("");
    setMediaFile(null);
    setMediaFileName("");
    setPublished(true);
    setThumbnail(null);
    setPreview(null);
  }

  function validateAndSetImage(file: File) {
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError(true);
      setTimeout(() => setImageError(false), 3000);
      return;
    }

    setImageError(false);
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  }

  function validateAndSetMediaFile(file: File) {
    let maxSize = MAX_VIDEO_SIZE;
    
    switch(mediaType) {
      case "video":
        maxSize = MAX_VIDEO_SIZE;
        break;
      case "pdf":
        maxSize = MAX_PDF_SIZE;
        break;
      case "audio":
        maxSize = MAX_AUDIO_SIZE;
        break;
      default:
        return;
    }

    if (file.size > maxSize) {
      setMediaError(true);
      setTimeout(() => setMediaError(false), 3000);
      return;
    }

    setMediaError(false);
    setMediaFile(file);
    setMediaFileName(file.name);
  }

  function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = () => (img.src = reader.result as string);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 500;
        const scale = MAX_WIDTH / img.width;

        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject();

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.6));
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  async function handleSubmit() {
    let hasError = false;

    if (!title.trim()) {
      setTitleError(true);
      hasError = true;
    } else {
      setTitleError(false);
    }

    if (mediaType === "external_url" && !url.trim()) {
      setMediaError(true);
      hasError = true;
    } else if (mediaType !== "external_url" && !mediaFile && !isEdit) {
      setMediaError(true);
      hasError = true;
    } else {
      setMediaError(false);
    }

    if (!isEdit && !thumbnail) {
      setImageError(true);
      hasError = true;
      setTimeout(() => setImageError(false), 3000);
    }

    if (hasError) return;

    try {
      setLoading(true);

      let imageBase64: string | undefined;
      let mediaBase64: string | undefined;

      if (thumbnail) {
        imageBase64 = await compressImage(thumbnail);
      }

      if (mediaFile) {
        mediaBase64 = await fileToBase64(mediaFile);
      }

      const payload: any = {
        module: moduleId,
        title: title.trim(),
        mediaType,
        published,
        order: 0,
      };

      if (mediaType === "external_url") {
        payload.url = url.trim();
      } else if (mediaBase64) {
        payload.media = mediaBase64;
        payload.mediaName = mediaFileName;
      } else if (isEdit && !mediaFile && initialData?.url) {
        payload.url = initialData.url;
      }

      if (imageBase64) {
        payload.thumbnail = imageBase64;
      } else if (isEdit && !thumbnail && preview) {
        payload.thumbnail = preview;
      }

      if (isEdit && initialData) {
        await api.put(`/lessons/${initialData.id}`, payload);
      } else {
        await api.post("/lessons", payload);
      }

      onCreated?.();
      onClose();
      resetForm();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 413) {
        setImageError(true);
        setTimeout(() => setImageError(false), 3000);
      }
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

  function handleMediaDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsMediaDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetMediaFile(file);
  }

  function getMediaIcon() {
    switch(mediaType) {
      case "video":
        return <FiVideo className="w-5 h-5 text-purple-400" />;
      case "pdf":
        return <FiFileText className="w-5 h-5 text-red-400" />;
      case "audio":
        return <FiHeadphones className="w-5 h-5 text-green-400" />;
      default:
        return <FiLink className="w-5 h-5 text-blue-400" />;
    }
  }

  function getMediaPlaceholder() {
    switch(mediaType) {
      case "video":
        return "https://www.youtube.com/watch?v=...";
      case "pdf":
        return "Selecione um arquivo PDF";
      case "audio":
        return "Selecione um arquivo de áudio";
      default:
        return "https://plataforma.com/ID";
    }
  }

  function getMaxSizeText() {
    switch(mediaType) {
      case "video":
        return "Máx 100MB";
      case "pdf":
        return "Máx 20MB";
      case "audio":
        return "Máx 50MB";
      default:
        return "";
    }
  }

  return createPortal(
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
                  {isEdit ? "Editar Aula" : "Nova Aula"}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {isEdit ? "Altere as informações da aula" : "Adicione uma nova aula ao módulo"}
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
                  {/* TÍTULO */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-300">
                      Título da aula
                    </label>
                    <div className="relative">
                      <FiType className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        placeholder="Ex: Introdução ao Módulo"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          if (titleError) setTitleError(false);
                        }}
                        className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#1A212F] border border-gray-700 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    {titleError && (
                      <div className="flex items-center gap-1 text-red-400 text-xs mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        Informe um título para a aula
                      </div>
                    )}
                  </div>

                  {/* TIPO MEDIA */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-300">
                      Tipo de conteúdo
                    </label>
                    <select
                      value={mediaType}
                      onChange={(e) => {
                        setMediaType(e.target.value);
                        setMediaError(false);
                        setMediaFile(null);
                        setMediaFileName("");
                        setUrl("");
                      }}
                      className="w-full h-11 px-4 rounded-lg bg-[#1A212F] border border-gray-700 text-gray-200 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="external_url">Link externo</option>
                      <option value="video">Vídeo</option>
                      <option value="audio">Áudio</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>

                  {/* MEDIA INPUT - URL ou Arquivo */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-300">
                      {mediaType === "external_url" ? "URL do conteúdo" : "Arquivo"}
                    </label>
                    
                    {mediaType === "external_url" ? (
                      <div className="relative">
                        <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          placeholder={getMediaPlaceholder()}
                          value={url}
                          onChange={(e) => {
                            setUrl(e.target.value);
                            if (mediaError) setMediaError(false);
                          }}
                          className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#1A212F] border border-gray-700 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          const input = document.querySelector('input[type="file"].media-file') as HTMLInputElement;
                          if (input) input.click();
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsMediaDragging(true);
                        }}
                        onDragLeave={() => setIsMediaDragging(false)}
                        onDrop={handleMediaDrop}
                        className={`
                          relative h-20 rounded-lg overflow-hidden cursor-pointer
                          border-2 border-dashed transition-all duration-200
                          flex items-center gap-3 px-4
                          ${mediaError 
                            ? 'border-red-500/50 bg-red-500/5' 
                            : isMediaDragging 
                              ? 'border-blue-500 bg-blue-500/5' 
                              : 'border-gray-700 hover:border-gray-600 bg-[#1A212F]'
                          }
                        `}
                      >
                        <div className={`
                          p-2 rounded-lg
                          ${mediaType === "video" ? "bg-purple-500/10" : ""}
                          ${mediaType === "pdf" ? "bg-red-500/10" : ""}
                          ${mediaType === "audio" ? "bg-green-500/10" : ""}
                        `}>
                          {getMediaIcon()}
                        </div>
                        
                        <div className="flex-1">
                          {mediaFile ? (
                            <p className="text-sm text-gray-200 font-medium truncate">
                              {mediaFileName}
                            </p>
                          ) : (
                            <>
                              <p className="text-sm text-gray-400">
                                {isMediaDragging ? 'Solte para enviar' : `Arraste um arquivo ou clique para selecionar`}
                              </p>
                              <p className="text-xs text-gray-600 mt-0.5">
                                {getMaxSizeText()}
                              </p>
                            </>
                          )}
                        </div>

                        <FiUpload className="w-4 h-4 text-gray-500" />

                        <input
                          type="file"
                          accept={
                            mediaType === "video" ? "video/*" :
                            mediaType === "audio" ? "audio/*" :
                            ".pdf"
                          }
                          className="hidden media-file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) validateAndSetMediaFile(file);
                          }}
                        />
                      </div>
                    )}
                    
                    {mediaError && (
                      <div className="flex items-center gap-1 text-red-400 text-xs mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        {mediaType === "external_url" 
                          ? "Informe uma URL para a aula" 
                          : `Selecione um arquivo válido (${getMaxSizeText()})`}
                      </div>
                    )}
                  </div>

                  {/* STATUS */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-300">
                      Status da aula
                    </label>
                    <select
                      value={published ? "published" : "draft"}
                      onChange={(e) => setPublished(e.target.value === "published")}
                      className="w-full h-11 px-4 rounded-lg bg-[#1A212F] border border-gray-700 text-gray-200 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="published">Publicada (visível para membros)</option>
                      <option value="draft">Rascunho (não visível)</option>
                    </select>
                  </div>
                </div>

                {/* Right Column - Thumbnail Upload */}
                <div>
                  <label className="text-sm text-gray-300">
                    Thumbnail {isEdit ? "(deixe vazio para manter a atual)" : ""}
                  </label>
                  <div
                    onClick={() => {
                      const input = document.querySelector('input[type="file"].thumbnail-file') as HTMLInputElement;
                      if (input) input.click();
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`
                      relative mt-2 h-[220px] rounded-lg overflow-hidden cursor-pointer
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
                        
                        <div className="border border-gray-700 rounded-lg px-3 py-1.5 mb-2">
                          <p className="text-xs text-gray-400">
                            348 x 188px (recomendado)
                          </p>
                        </div>
                        
                        <p className="text-xs text-gray-700">
                          PNG ou JPEG • Máx 2MB
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden thumbnail-file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) validateAndSetImage(file);
                      }}
                    />
                  </div>
                  {imageError && (
                    <div className="flex items-center gap-1 text-red-400 text-xs mt-2">
                      <AlertTriangle className="w-3 h-3" />
                      {!isEdit && !thumbnail ? "Adicione uma imagem para a aula" : "A imagem deve ter no máximo 2MB"}
                    </div>
                  )}
                  <p className="text-xs text-gray-600 mt-2">
                    * Thumbnail obrigatória. Tamanho recomendado: 348x188px.
                  </p>
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
                    {isEdit ? "Salvando..." : "Criando..."}
                  </>
                ) : (
                  isEdit ? "Salvar alterações" : "Criar Aula"
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