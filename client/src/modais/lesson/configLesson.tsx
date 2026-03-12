import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiFileText, FiClock, FiAlignLeft, FiUpload } from "react-icons/fi";
import { AlertTriangle } from "lucide-react";
import { api } from "../../services/api";

interface Lesson {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  media?: string;
  mediaType?: string;
  published: boolean;
  waitDays?: number;
  files?: Array<{
    name: string;
    url: string;
    size: number;
  }>;
}

interface ConfigLessonModalProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  lesson: Lesson;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ConfigLessonModal({
  open,
  onClose,
  onSaved,
  lesson,
}: ConfigLessonModalProps) {
  const [description, setDescription] = useState("");
  const [waitDays, setWaitDays] = useState(0);
  const [files, setFiles] = useState<Array<{ name: string; file: File }>>([]);
  const [existingFiles, setExistingFiles] = useState<Array<{ name: string; url: string; size: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Validações
  const [descriptionError, setDescriptionError] = useState(false);
  const [waitDaysError, setWaitDaysError] = useState(false);
  const [fileError, setFileError] = useState(false);

  useEffect(() => {
    if (!open || !lesson) return;

    setDescription(lesson.description || "");
    setWaitDays(lesson.waitDays || 0);
    setExistingFiles(lesson.files || []);
    setFiles([]);

    setDescriptionError(false);
    setWaitDaysError(false);
    setFileError(false);
  }, [open, lesson]);

  if (!open) return null;

  function validateAndAddFile(file: File) {
    if (file.size > MAX_FILE_SIZE) {
      setFileError(true);
      setTimeout(() => setFileError(false), 3000);
      return;
    }

    setFileError(false);
    setFiles(prev => [...prev, { name: file.name, file }]);
  }

  function removeFile(index: number, isExisting: boolean = false) {
    if (isExisting) {
      setExistingFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setFiles(prev => prev.filter((_, i) => i !== index));
    }
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

    if (waitDays < 0) {
      setWaitDaysError(true);
      hasError = true;
    } else {
      setWaitDaysError(false);
    }

    if (hasError) return;

    try {
      setLoading(true);

      // Converter novos arquivos para base64
      const newFilesBase64 = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          data: await fileToBase64(file.file),
          size: file.file.size
        }))
      );

      const payload = {
        description: description.trim(),
        waitDays,
        files: [
          ...existingFiles,
          ...newFilesBase64.map(f => ({
            name: f.name,
            url: f.data,
            size: f.size
          }))
        ]
      };

      await api.put(`/lessons/${lesson._id}/config`, payload);

      onSaved?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 413) {
        setFileError(true);
        setTimeout(() => setFileError(false), 3000);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(file => validateAndAddFile(file));
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
        <div className="relative w-full max-w-2xl">
          {/* Modal Card */}
          <div className="bg-[#141A26] border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 bg-[#1A212F] border-b border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Configurar Aula
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {lesson?.title}
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
              {/* DESCRIÇÃO */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-300 flex items-center gap-2">
                  <FiAlignLeft className="w-4 h-4" />
                  Descrição da aula
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (descriptionError) setDescriptionError(false);
                  }}
                  placeholder="Descreva o conteúdo desta aula..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-[#1A212F] border border-gray-700 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                />
                {descriptionError && (
                  <div className="flex items-center gap-1 text-red-400 text-xs mt-1">
                    <AlertTriangle className="w-3 h-3" />
                    Descrição inválida
                  </div>
                )}
              </div>

              {/* ARQUIVOS COMPLEMENTARES */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-300 flex items-center gap-2">
                  <FiFileText className="w-4 h-4" />
                  Arquivos complementares
                </label>
                
                {/* Área de upload */}
                <div
                  onClick={() => {
                    const input = document.querySelector('input[type="file"].files-input') as HTMLInputElement;
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
                    ${fileError 
                      ? 'border-red-500/50 bg-red-500/5' 
                      : isDragging 
                        ? 'border-blue-500 bg-blue-500/5' 
                        : 'border-gray-700 hover:border-gray-600 bg-[#1A212F]'
                    }
                    p-4
                  `}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <FiUpload className="w-6 h-6 text-gray-600 mb-2" />
                    <p className="text-sm text-gray-400 mb-1">
                      {isDragging ? 'Solte para enviar' : 'Arraste arquivos ou clique para selecionar'}
                    </p>
                    <p className="text-xs text-gray-600">
                      PDF, DOC, XLS, PPT, ZIP • Máx 10MB por arquivo
                    </p>
                  </div>

                  <input
                    type="file"
                    multiple
                    className="hidden files-input"
                    onChange={(e) => {
                      const selectedFiles = Array.from(e.target.files || []);
                      selectedFiles.forEach(file => validateAndAddFile(file));
                    }}
                  />
                </div>

                {/* Lista de arquivos existentes */}
                {existingFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-500">Arquivos atuais:</p>
                    {existingFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-[#1A212F] rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FiFileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span className="text-sm text-gray-300 truncate">{file.name}</span>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index, true);
                          }}
                          className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Lista de novos arquivos */}
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-500">Novos arquivos:</p>
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-[#1A212F] rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FiFileText className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-sm text-gray-300 truncate">{file.name}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index, false);
                          }}
                          className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {fileError && (
                  <div className="flex items-center gap-1 text-red-400 text-xs mt-2">
                    <AlertTriangle className="w-3 h-3" />
                    Arquivo muito grande. Máximo 10MB por arquivo.
                  </div>
                )}
              </div>

              {/* REGRAS - DIAS DE ESPERA */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-300 flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  Dias de espera para liberação
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={waitDays}
                    onChange={(e) => {
                      setWaitDays(Number(e.target.value));
                      if (waitDaysError) setWaitDaysError(false);
                    }}
                    placeholder="0 = liberação imediata"
                    className="w-full h-11 px-4 rounded-lg bg-[#1A212F] border border-gray-700 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                {waitDaysError && (
                  <div className="flex items-center gap-1 text-red-400 text-xs mt-1">
                    <AlertTriangle className="w-3 h-3" />
                    O valor não pode ser negativo
                  </div>
                )}
                <p className="text-xs text-gray-600 mt-1">
                  * Aluno terá que esperar este número de dias após a liberação do módulo anterior
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
                    Salvando...
                  </>
                ) : (
                  'Salvar'
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