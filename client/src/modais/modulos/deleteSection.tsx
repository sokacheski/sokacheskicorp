import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { AlertTriangle } from "lucide-react";

interface DeleteSectionProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sectionTitle?: string;
}

export default function DeleteSection({
  open,
  onClose,
  onConfirm,
  sectionTitle,
}: DeleteSectionProps) {
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
        <div className="relative w-full max-w-md">
          {/* Modal Card */}
          <div className="bg-[#141A26] border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 bg-[#1A212F] border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Excluir Seção
                  </h2>
                </div>
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
              <p className="text-gray-300 text-sm leading-relaxed">
                {sectionTitle ? (
                  <>Tem certeza que deseja excluir a seção <span className="text-red-400 font-medium">"{sectionTitle}"</span>?</>
                ) : (
                  <>Tem certeza que deseja excluir esta seção?</>
                )}
              </p>
              <p className="text-gray-400 text-sm mt-4">
                Esta ação não poderá ser desfeita.
              </p>
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
                onClick={onConfirm}
                className="px-5 h-10 rounded-lg bg-red-600/90 border border-red-500/30 text-white text-sm font-medium hover:bg-red-600 transition-all flex items-center gap-2"
              >
                <span>Excluir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}