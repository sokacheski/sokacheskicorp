import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Remove o toast após 3 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Container dos toasts */}
      <div className="fixed top-5 right-5 z-[999999] space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              transition-all duration-500 ease-in-out
              animate-slide-in-right
            `}
          >
            <div className="relative">
              {/* Efeito de glow nas bordas */}
              <div 
                className={`
                  absolute -inset-0.5 rounded-xl blur opacity-75 animate-pulse
                  ${toast.type === 'error' 
                    ? 'bg-gradient-to-r from-cyan-400 to-green-400' 
                    : 'bg-gradient-to-r from-green-600 to-emerald-600'
                  }
                `}
              />
              
              {/* Conteúdo do toast */}
              <div 
                className={`
                  relative bg-black border rounded-xl px-6 py-4
                  ${toast.type === 'error' 
                    ? 'border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.3)]' 
                    : 'border-green-600/30 shadow-[0_0_30px_rgba(5,150,105,0.3)]'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Ícone */}
                  <div className="relative">
                    <div 
                      className={`
                        absolute inset-0 rounded-full blur-sm animate-ping opacity-75
                        ${toast.type === 'error' ? 'bg-cyan-400' : 'bg-green-600'}
                      `}
                    />
                    <div 
                      className={`
                        relative w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${toast.type === 'error' 
                          ? 'border-cyan-400' 
                          : 'border-green-600'
                        }
                      `}
                    >
                      <span 
                        className={`
                          text-sm font-bold
                          ${toast.type === 'error' ? 'text-cyan-400' : 'text-green-600'}
                        `}
                      >
                        {toast.type === 'error' ? '!' : '✓'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Mensagem */}
                  <span className="text-white font-medium">
                    {toast.message}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};