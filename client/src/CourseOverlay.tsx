import { LockKeyhole } from 'lucide-react';

interface CourseOverlayProps {
  type: 'paid' | 'scheduled';
  salesUrl?: string;
  releaseDays?: number;
  isVertical?: boolean;
}

export default function CourseOverlay({ type, salesUrl, releaseDays, isVertical }: CourseOverlayProps) {
  // Ajustes responsivos baseados no tipo de capa
  const marginTop = isVertical ? 'mt-8 md:mt-12' : 'mt-12';
  const textSize = isVertical ? 'text-[10px] md:text-xs' : 'text-xs';
  const maxWidth = isVertical ? 'max-w-[130px] md:max-w-[160px]' : 'max-w-[160px]';
  const translateY = isVertical ? 'group-hover:-translate-y-12' : 'group-hover:-translate-y-8';

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
            <div className={`transform transition-all duration-300 ${translateY}`}>
              <LockKeyhole 
                size={72} 
                strokeWidth={1.8} 
                className="text-white/90" 
              />
            </div>
            
            {/* Frase que aparece no hover com fade in - agora com quebra de linha fixa */}
            <div className={`absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${marginTop}`}>
              <p className={`text-white/90 ${textSize} text-center ${maxWidth} leading-tight`}>
                Este é um conteúdo pago,<br />
                para desbloquear,<br />
                realize a compra.
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
        <div className={`transform transition-all duration-300 ${translateY}`}>
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
        <div className={`absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${marginTop}`}>
          <p className={`text-white/90 ${textSize} text-center ${maxWidth} leading-relaxed`}>
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