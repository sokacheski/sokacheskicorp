import { useCallback, useEffect, useRef, useState } from "react";
import {
  useNavigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { api } from "../services/api";
import { Search, ChevronRight, Users, TrendingUp, Home, Shield, Calendar, Menu, UserCircle } from "lucide-react";
import MarketBackground from "../seels/MarketBackground";
import CourseOverlay from "../CourseOverlay";
import { useUser } from "../contexts/UserContext";

interface Section {
  _id: string;
  title: string;
  layout: "horizontal" | "vertical";
  published: boolean;
}

interface Course {
  _id: string;
  title: string;
  image?: string;
  isPaid?: boolean;
  releaseDays?: number;
  salesUrl?: string;
  purchased?: boolean;
  purchaseDate?: string;
}

export default function MembersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: userLoading } = useUser();

  const [sections, setSections] = useState<Section[]>([]);
  const [coursesBySection, setCoursesBySection] = useState<
    Record<string, Course[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [showRightArrow, setShowRightArrow] = useState<Record<string, boolean>>({});
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const slidersRef = useRef<Record<string, HTMLDivElement | null>>({});

  const fullText = "Pequenas ações geram grandes resultados.";

  // ============================================================
  // BLOQUEIO TOTAL DE TRADUÇÃO - MÚLTIPLAS CAMADAS DE PROTEÇÃO
  // ============================================================
  useEffect(() => {
    document.documentElement.setAttribute('translate', 'no');
    document.body.setAttribute('translate', 'no');
    document.documentElement.lang = 'pt-BR';
    document.documentElement.setAttribute('xml:lang', 'pt-BR');
    
    const metaTags = document.querySelectorAll('meta[name="google"]');
    metaTags.forEach(tag => tag.remove());
    
    const meta = document.createElement('meta');
    meta.name = 'google';
    meta.content = 'notranslate';
    document.head.appendChild(meta);
    
    const meta2 = document.createElement('meta');
    meta2.name = 'microsoft';
    meta2.content = 'notranslate';
    document.head.appendChild(meta2);
    
    document.documentElement.style.webkitTextSizeAdjust = '100%';
    
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-text-size-adjust: 100%;
        text-size-adjust: 100%;
      }
      body, html, div, span, p, h1, h2, h3, h4, h5, h6, a, button, input, textarea {
        -webkit-text-fill-color: currentColor !important;
      }
    `;
    document.head.appendChild(style);
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              const element = node as HTMLElement;
              element.setAttribute('translate', 'no');
              element.querySelectorAll('*').forEach((child) => {
                child.setAttribute('translate', 'no');
              });
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Efeito de digitação
  useEffect(() => {
    if (!loading) {
      let i = 0;
      setDisplayText("");
      setIsTypingComplete(false);
      
      const typingEffect = setInterval(() => {
        if (i < fullText.length) {
          setDisplayText(fullText.substring(0, i + 1));
          i++;
        } else {
          setIsTypingComplete(true);
          clearInterval(typingEffect);
        }
      }, 50);

      return () => clearInterval(typingEffect);
    }
  }, [loading]);

  // Verifica se está em rota interna (curso OU modulo)
  const isInternalRoute = location.pathname.includes("/curso/") || 
                         location.pathname.includes("/modulo/");

  // Monitora scroll para efeito no topbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkScroll = (sectionId: string) => {
    const el = slidersRef.current[sectionId];
    if (!el) return;
    
    const canScrollRight = el.scrollWidth - el.scrollLeft - el.clientWidth > 10;
    setShowRightArrow(prev => ({ ...prev, [sectionId]: canScrollRight }));
  };

  const loadSections = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get<Section[]>(
        "/sections?published=true"
      );

      const coursesMap: Record<string, Course[]> = {};

      await Promise.all(
        data.map(async (section) => {
          try {
            const response = await api.get<Course[]>(
              `/courses/section/${section._id}?onlyAvailable=true`
            );
            
            const coursesWithAccess = response.data.map(course => ({
              ...course,
              purchased: false,
            }));
            
            coursesMap[section._id] = coursesWithAccess || [];
            
            setTimeout(() => checkScroll(section._id), 100);
          } catch {
            coursesMap[section._id] = [];
          }
        })
      );

      setSections(data || []);
      setCoursesBySection(coursesMap);
    } catch (err) {
      console.error("Erro ao carregar área de membros", err);
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isInternalRoute) {
      loadSections();
    }
  }, [loadSections, isInternalRoute]);

  const handleOpenCourse = (courseId: string, course: Course) => {
    if (course.isPaid && !course.purchased) {
      return;
    }
    
    if (course.releaseDays && course.releaseDays > 0) {
      return;
    }
    
    navigate(`/member/curso/${courseId}`);
  };

  const scroll = (sectionId: string, _direction: "right") => {
    const el = slidersRef.current[sectionId];
    if (!el) return;

    const scrollAmount = 400;
    el.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });

    setTimeout(() => checkScroll(sectionId), 300);
  };

  // Formatar data atual
  const currentDate = new Date();
  const month = currentDate.toLocaleString('pt-BR', { month: 'long' });
  const day = currentDate.getDate();
  const year = currentDate.getFullYear();
  const formattedDate = `${month.charAt(0).toUpperCase() + month.slice(1)} ${day}, ${year}`;

  // Links do menu
  const menuLinks = [
    { name: "Início", icon: Home, path: "/member" },
    { name: "Comunidade", icon: Users, path: "/member/comunidade" },
    { name: "Ranking", icon: TrendingUp, path: "/member/ranking" },
  ];

  // Links da barra inferior (mobile)
  const bottomNavLinks = [
    { name: "Início", icon: Home, path: "/member" },
    { name: "Comunidades", icon: Users, path: "/member/comunidade" },
    { name: "Perfil", icon: UserCircle, path: "/member/perfil" },
  ];

  if (isInternalRoute) {
    return (
      <div className="min-h-screen bg-black text-white" translate="no">
        <MarketBackground />
        <Outlet />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black" translate="no">
        <MarketBackground />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-blue-400/80 text-sm tracking-widest">CARREGANDO...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white" translate="no">
      {/* Background com efeitos de azul */}
      <div className="fixed inset-0 bg-black">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,100,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,50,150,0.15)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,30,100,0.15)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,80,200,0.05)_0%,transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/20 via-blue-800/10 to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-800/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-blue-700/10 rounded-full blur-3xl" />
      </div>
      
      {/* TOPBAR RESPONSIVO - TRANSPARENTE NO MOBILE */}
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ${
        scrolled 
          ? 'bg-black/95 backdrop-blur-md border-b border-blue-900/60' 
          : 'bg-black/60 backdrop-blur-sm border-b border-blue-900/30'
      }`}>
        {/* Efeito de brilho na borda */}
        <div className={`absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent transition-opacity duration-500 ${
          scrolled ? 'opacity-100' : 'opacity-50'
        }`} />
        <div className={`absolute bottom-0 left-1/4 w-1/2 h-[2px] bg-blue-500/40 blur-sm transition-all duration-500 ${
          scrolled ? 'opacity-100 scale-x-110' : 'opacity-50 scale-x-100'
        }`} />
        
        <div className="px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between relative">
          
          {/* Lado Esquerdo - Menu Hambúrguer (Mobile e Desktop) */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(true)} 
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <Menu size={22} className="text-white/80" />
            </button>
          </div>

          {/* Logo - Centralizado no Mobile, Esquerda no Desktop */}
          <div className="absolute left-1/2 transform -translate-x-1/2 md:relative md:left-0 md:transform-none">
            <div className="relative group cursor-pointer" onClick={() => navigate("/member")}>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-800/40 to-blue-600/40 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition" />
              <div 
                className="relative text-xl md:text-2xl font-black tracking-wide text-white"
                style={{ 
                  fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
                  textShadow: "0 0 20px rgba(30, 100, 255, 0.4)"
                }}
              >
                SOKACHESKI
              </div>
            </div>
          </div>

          {/* Menu Desktop (Computador) */}
          <nav className="hidden md:flex items-center gap-8 ml-8">
            <button 
              onClick={() => navigate("/member")}
              className="relative text-white/80 hover:text-white transition flex items-center group"
            >
              <Home size={16} className="mr-2 text-blue-400/60 group-hover:text-blue-400 transition" />
              Início
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blue-500/60 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </button>
            
            <button 
              onClick={() => navigate("/member/comunidade")}
              className="relative text-white/80 hover:text-white transition flex items-center group"
            >
              <Users size={16} className="mr-2 text-blue-400/60 group-hover:text-blue-400 transition" />
              Comunidade
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blue-500/60 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </button>
            
            <button 
              onClick={() => navigate("/member/ranking")}
              className="relative text-white/80 hover:text-white transition flex items-center group"
            >
              <TrendingUp size={16} className="mr-2 text-blue-400/60 group-hover:text-blue-400 transition" />
              Ranking
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blue-500/60 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </button>
          </nav>

          {/* Lado Direito - Busca e Perfil */}
          <div className="flex items-center gap-3">
            
            {/* Botão de Busca (Mobile e Desktop) */}
            <button 
              onClick={() => setSearchOpen(!searchOpen)} 
              className="p-2 hover:bg-white/10 rounded-lg transition relative group"
            >
              <Search size={20} className="text-white/60 group-hover:text-blue-400 transition" />
            </button>

            {/* Perfil - Ícone UserCircle com navegação */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-700 to-blue-500 rounded-full blur opacity-40 group-hover:opacity-70 transition" />
              <div className="relative w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-800 to-blue-600 p-[2px]">
                <button 
                  onClick={() => navigate("/member/perfil")}
                  className="w-full h-full rounded-full bg-black/90 flex items-center justify-center cursor-pointer"
                >
                  <UserCircle size={16} className="text-blue-400/70 group-hover:text-blue-400 transition" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Busca Expandida (Mobile) */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-3 pt-2 border-t border-blue-900/40 bg-black/90">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar cursos, membros..."
                className="w-full bg-[#1E293B] rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                autoFocus
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/60" />
            </div>
          </div>
        )}
      </header>

      {/* MENU MOBILE PROFISSIONAL - FUNDO PRETO */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" translate="no">
          {/* Overlay - clicar fora fecha o menu */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Lateral - fundo preto */}
          <div className="relative w-72 h-full bg-black shadow-2xl p-6 transform transition-transform duration-300 translate-x-0">
            {/* Logo Area - apenas SOKACHESKI */}
            <div className="mb-8 text-center">
              <h1 className="text-xl font-bold tracking-wider text-white">
                SOKACHESKI
              </h1>
            </div>

            {/* Navegação */}
            <nav className="flex flex-col gap-1">
              {menuLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <button
                    key={link.name}
                    onClick={() => {
                      navigate(link.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 group
                      ${isActive 
                        ? "bg-blue-950/80 text-blue-400 border-l-4 border-blue-600" 
                        : "text-gray-400 hover:text-gray-300 hover:bg-white/5"
                      }`}
                  >
                    <link.icon 
                      size={18} 
                      className={`transition-colors ${
                        isActive 
                          ? 'text-blue-400' 
                          : 'text-gray-500 group-hover:text-gray-400'
                      }`} 
                    />
                    <span className="flex-1 text-left">{link.name}</span>
                    {isActive && (
                      <span className="w-1 h-1 rounded-full bg-blue-500" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION BAR - APENAS MOBILE */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-t border-blue-900/50">
        <div className="flex items-center justify-around py-2">
          {bottomNavLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'text-blue-400' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <link.icon size={22} className={isActive ? 'text-blue-400' : 'text-current'} />
                <span className="text-[10px] font-medium tracking-wide">{link.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL - COM ESPAÇO PARA A BARRA INFERIOR */}
      <div className="pt-20 md:pt-28 pl-4 pr-4 md:pl-12 md:pr-8 pb-20 md:pb-16 space-y-12 relative z-10">
        {/* Banner de boas-vindas */}
        <div className="max-w-4xl space-y-3">
          <div className="flex items-center gap-2 text-blue-400/60 text-sm tracking-wide">
            <Calendar size={16} className="text-blue-400/80" />
            <span>Hoje é {formattedDate}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-light">
            <span className="text-white/60">Bem-Vindo de volta,</span>
            <span className="text-white font-bold ml-2">
              {userLoading ? '...' : user?.name || 'Aristocrata'}
            </span>
          </h1>
          <div className="relative">
            <p className="text-blue-400/70 text-xs md:text-sm max-w-2xl h-6">
              {displayText}
              {!isTypingComplete && <span className="animate-pulse ml-0.5">|</span>}
            </p>
            <div className="w-24 h-[2px] bg-gradient-to-r from-blue-500/60 to-transparent mt-4" />
          </div>
        </div>

        {sections.map((section) => {
          const courses = coursesBySection[section._id] || [];
          const isVertical = section.layout === "vertical";

          return (
            <section 
              key={section._id} 
              className="space-y-4"
              onMouseEnter={() => setHoveredSection(section._id)}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <h2 className="text-xl md:text-3xl font-semibold text-white">
                {section.title}
              </h2>

              <div className="relative">
                <div
                  ref={(el) => {
                    slidersRef.current[section._id] = el;
                    if (el) {
                      el.addEventListener('scroll', () => checkScroll(section._id));
                    }
                  }}
                  className={`flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide ${
                    isVertical ? "pl-4 md:pl-6" : ""
                  }`}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {courses.map((course, index) => {
                    const isPaidAndNotPurchased = course.isPaid && !course.purchased;
                    const isScheduled = course.releaseDays && course.releaseDays > 0;
                    const isBlocked = isPaidAndNotPurchased || isScheduled;

                    return (
                      <div
                        key={course._id}
                        onClick={() => handleOpenCourse(course._id, course)}
                        className={`relative rounded-xl overflow-hidden cursor-pointer flex-shrink-0
                          ${
                            isVertical
                              ? "w-[160px] md:w-[200px] h-[280px] md:h-[340px]"
                              : "min-w-[280px] md:min-w-[340px] h-[160px] md:h-[200px]"
                          }
                          ${isBlocked ? "cursor-default" : "cursor-pointer"}
                          transition-all duration-300
                          border border-blue-900/20
                        `}
                        style={{
                          animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                        }}
                      >
                        {course.image && (
                          <>
                            <img
                              src={course.image}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            
                            {isPaidAndNotPurchased && (
                              <CourseOverlay 
                                type="paid" 
                                salesUrl={course.salesUrl}
                                isVertical={isVertical}
                              />
                            )}
                            
                            {isScheduled && (
                              <CourseOverlay 
                                type="scheduled" 
                                releaseDays={course.releaseDays}
                                isVertical={isVertical}
                              />
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {courses.length >= 5 && showRightArrow[section._id] && (
                  <button
                    onClick={() => scroll(section._id, "right")}
                    className={`absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-black/80 backdrop-blur-sm border border-blue-800/40 rounded-full flex items-center justify-center hover:bg-blue-950/40 hover:border-blue-600/60 transition-all duration-300 group ${
                      hoveredSection === section._id ? 'opacity-100' : 'opacity-0 md:opacity-0'
                    }`}
                  >
                    <ChevronRight 
                      size={24} 
                      className="text-blue-400/50 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" 
                    />
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .animate-blink {
          animation: blink 1s infinite;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(30, 100, 255, 0.2);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(30, 100, 255, 0.3);
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}