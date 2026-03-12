import { LockKeyhole } from 'lucide-react';

interface CourseOverlayProps {
  type: 'paid' | 'scheduled';
  salesUrl?: string;
  releaseDays?: number;
}

export default function CourseOverlay({ type, salesUrl, releaseDays }: CourseOverlayProps) {
  if (type === 'paid') {
    return (
      <div className="absolute inset-0 bg-black/90 flex items-center justify-center group">
        <a
          href={salesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-full flex items-center justify-center"
        >
          <div className="flex flex-col items-center">
            {/* Cadeado com animação de subir */}
            <div className="transform transition-all duration-300 group-hover:-translate-y-8">
              <LockKeyhole 
                size={72} 
                strokeWidth={1.8} 
                className="text-white/90" 
              />
            </div>
            
            {/* Frase que aparece no hover com fade in */}
            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-12">
              <p className="text-white/90 text-xs text-center max-w-[160px] leading-relaxed">
                Este é um conteúdo pago, para desbloquear, realize a compra.
              </p>
            </div>
          </div>
        </a>
      </div>
    );
  }

  // Scheduled type
  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center group">
      <div className="flex flex-col items-center">
        {/* Ícone de relógio com animação de subir */}
        <div className="transform transition-all duration-300 group-hover:-translate-y-8">
          <svg 
            className="text-white/90" 
            width="72" 
            height="72" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        
        {/* Frase que aparece no hover */}
        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-12">
          <p className="text-white/90 text-xs text-center max-w-[160px] leading-relaxed">
            {releaseDays 
              ? `Será liberado em ${releaseDays} ${releaseDays === 1 ? 'dia' : 'dias'}`
              : 'Em breve estará disponível na plataforma.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}