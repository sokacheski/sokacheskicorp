import { useCallback, useEffect, useRef, useState } from "react";
import {
  useNavigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { api } from "../services/api";
import { Search, ChevronRight, Users, TrendingUp, Home, Shield, Calendar, Menu, X, Sparkles, Zap } from "lucide-react";
import MarketBackground from "../seels/MarketBackground";
import CourseOverlay from "../CourseOverlay";

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
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);

  const slidersRef = useRef<Record<string, HTMLDivElement | null>>({});

  const fullText = "Pequenas ações geram grandes resultados.";

  // Desabilitar tradução automática do navegador
  useEffect(() => {
    document.documentElement.setAttribute('translate', 'no');
    document.body.setAttribute('translate', 'no');
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
    { name: "Início", icon: Home, path: "/member", glow: "from-blue-500/20 to-cyan-500/20" },
    { name: "Comunidade", icon: Users, path: "/member/comunidade", glow: "from-purple-500/20 to-pink-500/20" },
    { name: "Ranking", icon: TrendingUp, path: "/member/ranking", glow: "from-yellow-500/20 to-orange-500/20" },
  ];

  if (isInternalRoute) {
    return (
      <div className="min-h-screen bg-black text-white">
        <MarketBackground />
        <Outlet />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
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
        {/* Grid com azul */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,100,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
        
        {/* Gradientes radiais com azul */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,50,150,0.15)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,30,100,0.15)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,80,200,0.05)_0%,transparent_50%)]" />
        
        {/* Manchas de luz azul */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/20 via-blue-800/10 to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-800/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-blue-700/10 rounded-full blur-3xl" />
      </div>
      
      {/* TOPBAR RESPONSIVO COM EFEITOS */}
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ${
        scrolled 
          ? 'bg-black/95 backdrop-blur-md border-b border-blue-900/60 shadow-[0_0_30px_rgba(0,100,255,0.1)]' 
          : 'bg-black/80 backdrop-blur-sm border-b border-blue-900/30'
      }`}>
        {/* Efeito de brilho na borda superior */}
        <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent transition-opacity duration-500 ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`} />
        
        {/* Efeito de brilho na borda inferior */}
        <div className={`absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent transition-opacity duration-500 ${
          scrolled ? 'opacity-100' : 'opacity-50'
        }`} />
        <div className={`absolute bottom-0 left-1/4 w-1/2 h-[2px] bg-blue-500/40 blur-sm transition-all duration-500 ${
          scrolled ? 'opacity-100 scale-x-110' : 'opacity-50 scale-x-100'
        }`} />
        
        <div className="px-4 sm:px-6 md:px-8 h-14 md:h-16 flex items-center justify-between relative">
          
          {/* Lado Esquerdo - Menu Hambúrguer (Mobile) com efeito glow */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(true)} 
              className="relative p-2 rounded-lg transition-all duration-300 hover:bg-white/10 group"
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all duration-300" />
              <Menu size={22} className="relative text-white/80 group-hover:text-blue-400 transition-colors" />
            </button>
          </div>

          {/* Logo com efeito glow animado */}
          <div className="absolute left-1/2 transform -translate-x-1/2 md:relative md:left-0 md:transform-none">
            <div className="relative group cursor-pointer" onClick={() => navigate("/member")}>
              {/* Efeito de glow animado */}
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-800/40 to-blue-600/40 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div 
                className="relative text-xl md:text-2xl font-black tracking-wide bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent"
                style={{ 
                  fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
                  textShadow: "0 0 30px rgba(30, 100, 255, 0.3)"
                }}
              >
                SOKACHESKI
              </div>
              {/* Linha decorativa abaixo da logo */}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 group-hover:w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent transition-all duration-500" />
            </div>
          </div>

          {/* Menu Desktop (Computador) com efeitos elegantes */}
          <nav className="hidden md:flex items-center gap-8 ml-8">
            {menuLinks.map((link) => (
              <button 
                key={link.name}
                onClick={() => navigate(link.path)}
                className="relative group py-2"
              >
                <span className="relative flex items-center gap-2 text-white/70 group-hover:text-white transition-colors duration-300">
                  <link.icon size={16} className="text-blue-400/60 group-hover:text-blue-400 transition-all duration-300 group-hover:scale-110" />
                  <span className="text-sm tracking-wide">{link.name}</span>
                </span>
                {/* Efeito de underline animado */}
                <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                {/* Efeito de glow no hover */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300 -z-10" />
              </button>
            ))}
          </nav>

          {/* Lado Direito - Busca e Perfil com efeitos */}
          <div className="flex items-center gap-2 md:gap-3">
            
            {/* Botão de Busca com efeito */}
            <button 
              onClick={() => setSearchOpen(!searchOpen)} 
              className="relative p-2 rounded-lg transition-all duration-300 hover:bg-white/10 group"
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all duration-300" />
              <Search size={18} className="relative text-white/60 group-hover:text-blue-400 transition-colors" />
            </button>

            {/* Perfil com efeito de anel luminoso */}
            <div className="relative group">
              {/* Anel luminoso animado */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-700 to-cyan-500 rounded-full blur opacity-40 group-hover:opacity-80 transition-opacity duration-300 animate-pulse" />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-700 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-800 to-blue-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-black/90 flex items-center justify-center group-hover:bg-black/70 transition-all">
                  <Shield size={14} className="text-blue-400/70 group-hover:text-blue-400 transition-colors group-hover:scale-110 duration-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Busca Expandida (Mobile) com animação */}
        <div className={`md:hidden px-4 pb-3 pt-2 border-t border-blue-900/40 bg-black/95 transition-all duration-300 ${searchOpen ? 'block' : 'hidden'}`}>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar cursos, membros..."
              className="w-full bg-gradient-to-r from-[#1E293B] to-[#0F172A] rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white border border-blue-900/30 focus:border-blue-500/50 transition-all"
              autoFocus
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/60" />
          </div>
        </div>
      </header>

      {/* MENU MOBILE ESTILOSO (Hambúrguer) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay com blur */}
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-md transition-all duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Lateral com efeito glassmorphism */}
          <div className="relative w-80 bg-black/80 backdrop-blur-xl h-full shadow-2xl border-r border-blue-900/50 p-6 transform transition-transform duration-300 animate-slideIn">
            {/* Efeito de brilho superior */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            
            <div className="flex justify-between items-center mb-8">
              <div 
                className="relative group cursor-pointer"
                onClick={() => {
                  navigate("/member");
                  setMobileMenuOpen(false);
                }}
              >
                <div 
                  className="text-xl font-black tracking-wide bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  SOKACHESKI
                </div>
                <div className="absolute -bottom-1 left-0 w-8 h-[2px] bg-gradient-to-r from-blue-500 to-transparent" />
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300 group"
              >
                <X size={22} className="text-white/70 group-hover:text-blue-400 transition-colors" />
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              {menuLinks.map((link, index) => (
                <button
                  key={link.name}
                  onClick={() => {
                    navigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className="relative group overflow-hidden rounded-lg transition-all duration-300 hover:translate-x-1"
                  style={{ animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both` }}
                >
                  {/* Efeito de fundo gradiente no hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${link.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative flex items-center gap-3 py-3 px-4 text-white/80 group-hover:text-white transition-colors">
                    <link.icon size={20} className="text-blue-400/70 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300" />
                    <span className="font-medium tracking-wide">{link.name}</span>
                    <Sparkles size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-400" />
                  </div>
                </button>
              ))}
            </div>

            {/* Linha decorativa inferior */}
            <div className="absolute bottom-8 left-6 right-6">
              <div className="h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
              <p className="text-center text-xs text-white/30 mt-4 tracking-wider">SOKACHESKI CORP</p>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <div className="pt-24 md:pt-28 pl-4 pr-4 md:pl-12 md:pr-8 pb-16 space-y-12 relative z-10">
        {/* Banner de boas-vindas com efeito */}
        <div className="max-w-4xl space-y-3 animate-fadeInUp">
          <div className="flex items-center gap-2 text-blue-400/60 text-sm tracking-wide">
            <Calendar size={16} className="text-blue-400/80" />
            <span>Hoje é {formattedDate}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-light">
            <span className="text-white/60">Bem-Vindo de volta,</span>
            <span className="text-white font-bold ml-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Aristocrata</span>
          </h1>
          <div className="relative">
            <p className="text-blue-400/70 text-xs md:text-sm max-w-2xl h-6 flex items-center gap-1">
              <Zap size={12} className="text-blue-500" />
              {displayText}
              {!isTypingComplete && <span className="animate-pulse ml-0.5 text-blue-400">|</span>}
            </p>
            {/* Linha decorativa azul com efeito */}
            <div className="w-24 h-[2px] bg-gradient-to-r from-blue-500/60 via-blue-400/40 to-transparent mt-4" />
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
              {/* Título da seção */}
              <h2 className="text-xl md:text-3xl font-semibold text-white">
                {section.title}
              </h2>

              <div className="relative">
                {/* Container do slider */}
                <div
                  ref={(el) => {
                    slidersRef.current[section._id] = el;
                    if (el) {
                      el.addEventListener('scroll', () => checkScroll(section._id));
                    }
                  }}
                  className={`flex gap-3 md:gap-6 overflow-x-auto pb-4 scrollbar-hide ${
                    isVertical ? "pl-4 md:pl-6" : ""
                  }`}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {courses.map((course, index) => {
                    const isPaidAndNotPurchased = course.isPaid && !course.purchased;
                    const isScheduled = course.releaseDays && course.releaseDays > 0;
                    const isBlocked = isPaidAndNotPurchased || isScheduled;
                    const courseId = course._id;

                    return (
                      <div
                        key={courseId}
                        onClick={() => handleOpenCourse(courseId, course)}
                        onMouseEnter={() => setHoveredCourse(courseId)}
                        onMouseLeave={() => setHoveredCourse(null)}
                        onTouchStart={() => setHoveredCourse(courseId)}
                        onTouchEnd={() => setHoveredCourse(null)}
                        className={`relative rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300
                          ${
                            isVertical
                              ? "w-[140px] md:w-[200px] h-[240px] md:h-[340px]"
                              : "min-w-[260px] md:min-w-[340px] h-[150px] md:h-[200px]"
                          }
                          ${isBlocked ? "cursor-default" : "cursor-pointer"}
                          border border-blue-900/20
                        `}
                        style={{
                          animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`
                        }}
                      >
                        {course.image && (
                          <>
                            <img
                              src={course.image}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            
                            {/* OVERLAY DE BLOQUEIO - SEMPRE VISÍVEL COM EFEITO DE SUBIR NO HOVER */}
                            {isBlocked && (
                              <div 
                                className={`absolute inset-0 z-10 transition-all duration-300 ${
                                  hoveredCourse === courseId 
                                    ? 'translate-y-0' 
                                    : 'translate-y-full'
                                }`}
                              >
                                <CourseOverlay 
                                  type={isPaidAndNotPurchased ? "paid" : "scheduled"} 
                                  salesUrl={course.salesUrl}
                                  releaseDays={course.releaseDays}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* SETA DIREITA */}
                {courses.length >= 5 && showRightArrow[section._id] && (
                  <button
                    onClick={() => scroll(section._id, "right")}
                    className={`absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-12 md:h-12 bg-black/80 backdrop-blur-sm border border-blue-800/40 rounded-full flex items-center justify-center hover:bg-blue-950/60 hover:border-blue-600/60 transition-all duration-300 ${
                      hoveredSection === section._id ? 'opacity-100' : 'opacity-0 md:opacity-0'
                    }`}
                  >
                    <ChevronRight size={20} className="text-blue-400/50 hover:text-blue-400" />
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Estilos globais */}
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
        
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
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