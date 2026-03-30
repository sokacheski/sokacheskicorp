import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Search, Home, Users, TrendingUp, Menu, UserCircle, Calendar, ChevronRight, ArrowLeft } from "lucide-react";

interface Module {
  _id: string;
  title: string;
  image?: string;
  published: boolean;
}

interface Section {
  _id: string;
  title: string;
  layout: "horizontal" | "vertical";
  published: boolean;
  items?: Module[];
  modules?: Module[];
}

interface Course {
  _id: string;
  title: string;
}

interface CourseResponse {
  course: Course;
  sections: Section[];
}

export default function CourseView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showIntro, setShowIntro] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [showRightArrow, setShowRightArrow] = useState<Record<string, boolean>>({});

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

  // Monitora scroll para efeito no topbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!id) return;
    loadCourse(id);
  }, [id]);

  async function loadCourse(courseId: string) {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get<CourseResponse>(
        `/courses/${courseId}/full`
      );
      setCourse(data.course || null);
      setSections(data.sections || []);
      
      // Verifica scroll em cada seção após carregar
      setTimeout(() => {
        sections.forEach(section => checkScroll(section._id));
      }, 100);
    } catch (err) {
      console.error("Erro ao carregar curso", err);
      setError("Erro ao carregar curso.");
      setSections([]);
    } finally {
      setLoading(false);
    }
  }

  // Função para lidar com o clique no módulo
  async function handleModuleClick(moduleId: string) {
    try {
      console.log("Clicou no módulo:", moduleId);
      
      const response = await api.get(`/members/modules/${moduleId}/lessons`);
      console.log("Aulas encontradas:", response.data);
      
      if (response.data.length > 0) {
        const primeiraAulaId = response.data[0]._id;
        console.log("Navegando para:", `/member/modulo/${moduleId}/aula/${primeiraAulaId}`);
        navigate(`/member/modulo/${moduleId}/aula/${primeiraAulaId}`);
      } else {
        alert("Este módulo ainda não tem aulas disponíveis.");
      }
    } catch (error) {
      console.error("Erro ao carregar aulas do módulo:", error);
      alert("Erro ao acessar o módulo. Tente novamente.");
    }
  }

  const checkScroll = (sectionId: string) => {
    const el = document.getElementById(`slider-${sectionId}`);
    if (!el) return;
    
    const canScrollRight = el.scrollWidth - el.scrollLeft - el.clientWidth > 10;
    setShowRightArrow(prev => ({ ...prev, [sectionId]: canScrollRight }));
  };

  const scroll = (sectionId: string) => {
    const el = document.getElementById(`slider-${sectionId}`);
    if (!el) return;

    const scrollAmount = 400;
    el.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });

    setTimeout(() => checkScroll(sectionId), 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 1700);
    return () => clearTimeout(timer);
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black" translate="no">
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-blue-400/80 text-sm tracking-widest">CARREGANDO CURSO...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black" translate="no">
        <div className="relative z-10 text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate("/member")}
            className="px-6 py-2 bg-blue-600/20 border border-blue-500/50 rounded-lg text-blue-400 hover:bg-blue-600/30 transition"
          >
            Voltar para Área de Membros
          </button>
        </div>
      </div>
    );
  }

  const courseName = course?.title || "Curso";

  return (
    <div className="relative min-h-screen bg-black text-white" translate="no">
      {/* Background com efeitos de azul - MESMO DA ÁREA DE MEMBROS */}
      <div className="fixed inset-0 bg-black">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,100,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,50,150,0.15)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,30,100,0.15)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,80,200,0.05)_0%,transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/20 via-blue-800/10 to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-800/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-blue-700/10 rounded-full blur-3xl" />
      </div>

      {/* TOPBAR RESPONSIVO - MESMO DA ÁREA DE MEMBROS */}
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ${
        scrolled 
          ? 'bg-black/95 backdrop-blur-md border-b border-blue-900/60' 
          : 'bg-black/60 backdrop-blur-sm border-b border-blue-900/30'
      }`}>
        <div className={`absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent transition-opacity duration-500 ${
          scrolled ? 'opacity-100' : 'opacity-50'
        }`} />
        <div className={`absolute bottom-0 left-1/4 w-1/2 h-[2px] bg-blue-500/40 blur-sm transition-all duration-500 ${
          scrolled ? 'opacity-100 scale-x-110' : 'opacity-50 scale-x-100'
        }`} />
        
        <div className="px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between relative">
          
          {/* Lado Esquerdo - Menu Hambúrguer + Botão Voltar */}
          <div className="flex items-center gap-2">
            {/* Botão Voltar */}
            <button 
              onClick={() => navigate("/member")} 
              className="p-2 hover:bg-white/10 rounded-lg transition group"
            >
              <ArrowLeft size={20} className="text-white/60 group-hover:text-blue-400 transition" />
            </button>
            
            {/* Menu Hamburguer (Mobile) */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(true)} 
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <Menu size={22} className="text-white/80" />
              </button>
            </div>
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
            <button 
              onClick={() => setSearchOpen(!searchOpen)} 
              className="p-2 hover:bg-white/10 rounded-lg transition relative group"
            >
              <Search size={20} className="text-white/60 group-hover:text-blue-400 transition" />
            </button>

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

        {/* Barra de Busca Expandida */}
        {searchOpen && (
          <div className="px-4 pb-3 pt-2 border-t border-blue-900/40 bg-black/90">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar aulas..."
                className="w-full bg-[#1E293B] rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                autoFocus
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/60" />
            </div>
          </div>
        )}
      </header>

      {/* MENU MOBILE */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" translate="no">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          <div className="relative w-72 h-full bg-black shadow-2xl p-6 transform transition-transform duration-300 translate-x-0">
            <div className="mb-8 text-center">
              <h1 className="text-xl font-bold tracking-wider text-white">
                SOKACHESKI
              </h1>
            </div>

            <nav className="flex flex-col gap-1">
              {menuLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    navigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 group text-gray-400 hover:text-gray-300 hover:bg-white/5"
                >
                  <link.icon size={18} className="text-gray-500 group-hover:text-gray-400 transition-colors" />
                  <span className="flex-1 text-left">{link.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION BAR - APENAS MOBILE */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-t border-blue-900/50">
        <div className="flex items-center justify-around py-2">
          {bottomNavLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => navigate(link.path)}
              className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all duration-200 text-white/60 hover:text-white"
            >
              <link.icon size={22} className="text-current" />
              <span className="text-[10px] font-medium tracking-wide">{link.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* OVERLAY DE INTRODUÇÃO - ESTILIZADO */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div
            className="text-center animate-intro text-4xl md:text-6xl font-bold tracking-wide"
            style={{
              textShadow: "0 0 20px #3b82f6, 0 0 40px #3b82f6",
              fontFamily: "'Playfair Display', 'Cormorant Garamond', serif"
            }}
          >
            {courseName}
          </div>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL - MÓDULOS DO CURSO */}
      <div className="pt-28 md:pt-32 pl-4 pr-4 md:pl-12 md:pr-8 pb-24 md:pb-16 space-y-12 relative z-10">
        {/* Banner do curso */}
        <div className="max-w-4xl space-y-3">
          <div className="flex items-center gap-2 text-blue-400/60 text-sm tracking-wide">
            <Calendar size={16} className="text-blue-400/80" />
            <span>Hoje é {formattedDate}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-light">
            <span className="text-white/60">Curso:</span>
            <span className="text-white font-bold ml-2">
              {courseName}
            </span>
          </h1>
          <div className="w-24 h-[2px] bg-gradient-to-r from-blue-500/60 to-transparent mt-4" />
        </div>

        {sections.map((section) => {
          const modules = section.items || section.modules || [];
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
                  id={`slider-${section._id}`}
                  className={`flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide ${
                    isVertical ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 overflow-x-visible" : ""
                  }`}
                  style={!isVertical ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}
                  onScroll={() => !isVertical && checkScroll(section._id)}
                >
                  {modules.map((module, index) => (
                    <div
                      key={module._id}
                      onClick={() => handleModuleClick(module._id)}
                      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300
                        ${
                          isVertical
                            ? "w-full h-[280px] md:h-[340px]"
                            : "min-w-[280px] md:min-w-[340px] h-[160px] md:h-[200px] flex-shrink-0"
                        }
                        border border-blue-900/20 hover:border-blue-500/40 hover:scale-[1.02]
                      `}
                      style={{
                        animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                      }}
                    >
                      {module.image && (
                        <>
                          <img
                            src={module.image}
                            alt={module.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white font-semibold text-lg md:text-xl">
                              {module.title}
                            </h3>
                            <p className="text-blue-400/80 text-xs mt-1 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                              Clique para acessar
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {!isVertical && modules.length >= 5 && showRightArrow[section._id] && (
                  <button
                    onClick={() => scroll(section._id)}
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
        
        @keyframes introAnim {
          0% { opacity: 0; transform: translateY(40px) scale(0.95); }
          30% { opacity: 1; transform: translateY(0) scale(1); }
          70% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-60px) scale(1.05); }
        }
        
        .animate-intro {
          animation: introAnim 1.7s ease forwards;
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