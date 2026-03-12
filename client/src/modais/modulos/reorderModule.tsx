import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import { FiX } from "react-icons/fi";
import { api } from "../../services/api";
import { toast } from "react-hot-toast";

interface Module {
  _id: string;
  title: string;
  order: number;
  section: string;
}

interface ReorderModuleProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  sectionId: string;
  modules: Module[];
}

export default function ReorderModule({
  open,
  onClose,
  onSave,
  sectionId,
  modules,
}: ReorderModuleProps) {
  const [items, setItems] = useState<Module[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && modules && modules.length > 0) {
      const sortedModules = [...modules].sort((a, b) => a.order - b.order);
      setItems(sortedModules);
    } else if (open && (!modules || modules.length === 0)) {
      setItems([]);
    }
  }, [open, modules]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
  };

  const handleSave = async () => {
    if (!sectionId) {
      toast.error("ID da seção não encontrado");
      return;
    }

    try {
      setIsSaving(true);
      
      const orderedIds = items.map(item => item._id);
      
      await api.post("/api/modules/reorder", { 
        orderedIds,
        sectionId 
      });
      
      toast.success("Ordem dos módulos atualizada!");
      
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao reordenar:", error);
      toast.error("Erro ao salvar ordem. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

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
                  Reordenar Módulos
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Arraste para ordenar os módulos como preferir
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
              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border border-gray-800 rounded-lg">
                  Nenhum módulo disponível nesta seção
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="modules">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
                      >
                        {items.map((module, index) => (
                          <Draggable
                            key={module._id}
                            draggableId={module._id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`
                                  group relative flex items-center gap-4 p-4 rounded-lg
                                  border transition-all duration-200
                                  ${snapshot.isDragging 
                                    ? 'border-blue-500/50 bg-blue-500/10 ring-2 ring-blue-500/20' 
                                    : 'border-gray-700 bg-[#1A212F] hover:border-gray-600'
                                  }
                                `}
                              >
                                {/* ÍCONE DE ARRASTAR */}
                                <div
                                  {...provided.dragHandleProps}
                                  className="
                                    cursor-grab active:cursor-grabbing 
                                    p-2 rounded-lg
                                    text-gray-500
                                    hover:text-gray-400
                                    transition-colors
                                  "
                                >
                                  <GripVertical size={20} strokeWidth={1.5} />
                                </div>

                                {/* TÍTULO DO MÓDULO */}
                                <span className="flex-1 text-gray-200 font-medium truncate">
                                  {module.title}
                                </span>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-[#1A212F] border-t border-gray-800 flex items-center justify-end gap-4">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-5 h-10 rounded-lg border border-gray-700 text-gray-400 text-sm hover:text-gray-300 hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || items.length === 0}
                className="px-6 h-10 rounded-lg bg-blue-600/90 border border-blue-500/30 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Ordem'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
        }
      `}</style>
    </div>,
    document.body
  );
}