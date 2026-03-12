import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { 
  FiPlay, FiFile, FiHeadphones, FiLink, 
  FiChevronLeft, FiChevronRight, FiCheckCircle,
  FiClock, FiMaximize, FiVolume2, FiSearch,
  FiChevronDown, FiChevronUp, FiVideo,
  FiMic, FiFileText, FiSend, FiUser,
  FiEye, FiDownload
} from "react-icons/fi";
import { FaStar, FaRegStar, FaPlay } from "react-icons/fa";
import { IoMdNuclear } from "react-icons/io";
import { RiFlashlightFill } from "react-icons/ri";
import { HiOutlineSparkles } from "react-icons/hi";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  mediaType: "external" | "upload" | "audio" | "pdf" | "video";
  media: string;
  image: string;
  duration?: string;
  module: {
    _id: string;
    title: string;
    description?: string;
  };
}

interface Module {
  _id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

export default function LessonView() {
  const { moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModuleDropdown, setShowModuleDropdown] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isHologramMode, setIsHologramMode] = useState(false);

  useEffect(() => {
    async function loadLesson() {
      try {
        setLoading(true);
        
        const response = await api.get(`/members/modules/${moduleId}/lessons`);
        setLessons(response.data);
        
        if (response.data.length > 0) {
          const modulesMap = new Map();
          response.data.forEach((lesson: Lesson) => {
            if (lesson.module && lesson.module._id) {
              if (!modulesMap.has(lesson.module._id)) {
                modulesMap.set(lesson.module._id, {
                  _id: lesson.module._id,
                  title: lesson.module.title,
                  description: lesson.module.description,
                  lessons: []
                });
              }
              modulesMap.get(lesson.module._id).lessons.push(lesson);
            }
          });
          
          setModules(Array.from(modulesMap.values()));
        }
        
        let targetLessonId = lessonId;
        if (!targetLessonId && response.data.length > 0) {
          targetLessonId = response.data[0]._id;
          navigate(`/member/modulo/${moduleId}/aula/${targetLessonId}`, { replace: true });
          return;
        }
        
        const foundLesson = response.data.find((l: Lesson) => l._id === targetLessonId);
        
        if (foundLesson) {
          setLesson(foundLesson);
          document.title = `${foundLesson.title} - Aristocrata Club`;
        } else {
          setError("Aula não encontrada");
        }
      } catch (err) {
        console.error("Erro ao carregar aula:", err);
        setError("Erro ao carregar aula");
      } finally {
        setLoading(false);
      }
    }

    if (moduleId) {
      loadLesson();
    }
  }, [moduleId, lessonId, navigate]);

  const goToNextLesson = () => {
    const currentIndex = lessons.findIndex(l => l._id === lesson?._id);
    if (currentIndex < lessons.length - 1) {
      navigate(`/member/modulo/${moduleId}/aula/${lessons[currentIndex + 1]._id}`);
    }
  };

  const goToPrevLesson = () => {
    const currentIndex = lessons.findIndex(l => l._id === lesson?._id);
    if (currentIndex > 0) {
      navigate(`/member/modulo/${moduleId}/aula/${lessons[currentIndex - 1]._id}`);
    }
  };

  const handleModuleChange = (newModuleId: string) => {
    setShowModuleDropdown(false);
    navigate(`/member/modulo/${newModuleId}/aula`);
  };

  const handleComplete = () => {
    setIsCompleted(!isCompleted);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setNewComment("");
  };

  const getMediaIcon = (type: string) => {
    switch(type) {
      case 'video': return <FiVideo className="text-cyan-400" size={16} />;
      case 'audio': return <FiMic className="text-fuchsia-400" size={16} />;
      case 'pdf': return <FiFileText className="text-amber-400" size={16} />;
      default: return <FiFile className="text-gray-400" size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/30 rounded-full blur-[128px] animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[96px] animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="relative">
            <IoMdNuclear className="text-6xl text-cyan-400 animate-spin-slow mx-auto mb-4" />
            <div className="absolute inset-0 bg-cyan-400/20 blur-2xl animate-pulse"></div>
          </div>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 font-mono text-sm">
            INICIALIZANDO SISTEMA...
          </p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <><div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=" />60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"{">"}</div><div className="relative bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
          <div className="text-center">
            <div className="text-6xl mb-4 text-cyan-400 animate-bounce">⚠️</div>
            <h1 className="text-3xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">
                ERRO 404
              </span>
            </h1>
            <p className="text-cyan-300/70 mb-6 font-mono text-sm">
              {error || "AULA NÃO ENCONTRADA NO SISTEMA"}
            </p>
            <Link
              to="/member"
              className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white rounded-lg font-mono text-sm tracking-wider hover:from-cyan-600 hover:to-fuchsia-600 transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:shadow-[0_0_50px_rgba(6,182,212,0.8)]"
            >
              RETORNAR À BASE
            </Link>
          </div>
        </div></>
    );
  }

  const currentIndex = lessons.findIndex(l => l._id === lesson._id);
  const hasNext = currentIndex < lessons.length - 1;
  const hasPrev = currentIndex > 0;

  const renderMedia = () => {
    return (
      <div className="relative group">
        <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden border border-cyan-500/30">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-20"></div>
          
          <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {lesson.mediaType === "video" || lesson.mediaType === "external" ? (
            <iframe
              src={lesson.media}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : lesson.mediaType === "audio" ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="absolute inset-0 bg-cyan-500/30 rounded-full animate-ping"></div>
                  <div className="absolute inset-2 bg-fuchsia-500/40 rounded-full animate-pulse"></div>
                  <div className="absolute inset-4 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-full flex items-center justify-center">
                    <FiVolume2 className="text-white text-3xl" />
                  </div>
                </div>
                <audio controls className="w-80 mt-4">
                  <source src={lesson.media} type="audio/mpeg" />
                </audio>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <FiFileText className="text-6xl text-cyan-400 mx-auto mb-4" />
                <p className="text-cyan-300/70 font-mono text-sm">FORMATO NÃO SUPORTADO</p>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="p-2 bg-black/60 backdrop-blur-md border border-cyan-500/50 rounded-lg text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all">
              <FiMaximize size={18} />
            </button>
            <button 
              onClick={() => setIsHologramMode(!isHologramMode)}
              className={`p-2 backdrop-blur-md border rounded-lg transition-all ${
                isHologramMode 
                  ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-400' 
                  : 'bg-black/60 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20'
              }`}
            >
              <HiOutlineSparkles size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f1a_1px,transparent_1px),linear-gradient(to_bottom,#0f0f1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fuchsia-500/5 to-transparent"></div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-cyan-500/30 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            to="/member"
            className="relative group"
          >
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              ARISTOCRATA
            </span>
            <span className="absolute -top-1 -right-4 text-xs text-cyan-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
              v2.0
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {["INÍCIO", "COMUNIDADE", "RANKING"].map((item) => (
              <button
                key={item}
                className="relative text-sm font-mono tracking-wider text-gray-400 hover:text-cyan-400 transition-colors group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-cyan-400 to-fuchsia-400 group-hover:w-full transition-all duration-300"></span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                onClick={goToPrevLesson}
                disabled={!hasPrev}
                className={`p-2 rounded-lg transition-all ${
                  hasPrev 
                    ? 'text-cyan-400 hover:bg-cyan-500/10 hover:text-fuchsia-400' 
                    : 'text-gray-600 cursor-not-allowed'
                }`}
              >
                <FiChevronLeft size={20} />
              </button>
              
              <span className="text-xs font-mono text-cyan-400/50 px-2">
                {String(currentIndex + 1).padStart(2, '0')}/{String(lessons.length).padStart(2, '0')}
              </span>
              
              <button
                onClick={goToNextLesson}
                disabled={!hasNext}
                className={`p-2 rounded-lg transition-all ${
                  hasNext 
                    ? 'text-cyan-400 hover:bg-cyan-500/10 hover:text-fuchsia-400' 
                    : 'text-gray-600 cursor-not-allowed'
                }`}
              >
                <FiChevronRight size={20} />
              </button>
            </div>

            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <FiUser className="text-cyan-400" size={18} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 pt-24 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <div className="lg:col-span-3 space-y-6">
            
            {renderMedia()}

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-500"></div>
              
              <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-mono text-cyan-400">
                        AULA {String(currentIndex + 1).padStart(2, '0')}
                      </span>
                      <span className="px-3 py-1 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-full text-xs font-mono text-fuchsia-400">
                        {lesson.mediaType.toUpperCase()}
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {lesson.title}
                    </h1>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleComplete}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                        isCompleted 
                          ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                          : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                      }`}
                    >
                      <FiCheckCircle size={18} />
                      <span className="text-sm font-mono">
                        {isCompleted ? 'CONCLUÍDO' : 'CONCLUIR'}
                      </span>
                    </button>
                  </div>
                </div>

                <p className="text-gray-400 leading-relaxed mb-6 font-mono text-sm">
                  {lesson.description || "Navegue pelo conteúdo holográfico para acessar os materiais de apoio e recursos adicionais."}
                </p>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-cyan-400">
                    <FiClock size={14} />
                    <span className="font-mono">{lesson.duration || "04:01"}</span>
                  </div>
                  <div className="w-1 h-1 bg-cyan-500/30 rounded-full"></div>
                  <div className="flex items-center gap-1 text-fuchsia-400">
                    <FiEye size={14} />
                    <span className="font-mono">1.2k</span>
                  </div>
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-cyan-500/20"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-gradient-to-br from-gray-900 to-black px-4 text-xs font-mono text-cyan-400/50">
                      RECURSOS DA AULA
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 bg-black/40 border border-cyan-500/20 rounded-lg hover:border-cyan-500/50 transition-all group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <FiFileText className="text-amber-400" />
                      <div>
                        <p className="text-white text-sm group-hover:text-cyan-400 transition-colors">
                          Material de apoio.pdf
                        </p>
                        <p className="text-xs text-gray-500 font-mono">2.5 MB</p>
                      </div>
                    </div>
                    <FiDownload className="text-gray-500 group-hover:text-cyan-400 transition-colors" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-black/40 border border-cyan-500/20 rounded-lg hover:border-cyan-500/50 transition-all group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <FiHeadphones className="text-fuchsia-400" />
                      <div>
                        <p className="text-white text-sm group-hover:text-cyan-400 transition-colors">
                          Áudio da aula.mp3
                        </p>
                        <p className="text-xs text-gray-500 font-mono">15 min</p>
                      </div>
                    </div>
                    <FiDownload className="text-gray-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-cyan-500/20"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-gradient-to-br from-gray-900 to-black px-4 text-xs font-mono text-cyan-400/50">
                      COMENTÁRIOS
                    </span>
                  </div>
                </div>

                <form onSubmit={handleCommentSubmit} className="relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Digite seu comentário..."
                    className="w-full bg-black/40 border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 font-mono text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-lg text-white hover:from-cyan-600 hover:to-fuchsia-600 transition-all"
                  >
                    <FiSend size={18} />
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            
            <div className="relative">
              <button
                onClick={() => setShowModuleDropdown(!showModuleDropdown)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm border border-cyan-500/30 rounded-xl hover:border-cyan-400 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                    <RiFlashlightFill className="text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-mono text-cyan-400/50">MÓDULO ATUAL</p>
                    <p className="text-white font-mono text-sm truncate max-w-[150px]">
                      {lesson.module?.title}
                    </p>
                  </div>
                </div>
                {showModuleDropdown ? (
                  <FiChevronUp className="text-cyan-400" />
                ) : (
                  <FiChevronDown className="text-cyan-400" />
                )}
              </button>

              {showModuleDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-cyan-500/30 rounded-xl overflow-hidden z-50 backdrop-blur-xl">
                  {modules.map((module) => (
                    <button
                      key={module._id}
                      onClick={() => handleModuleChange(module._id)}
                      className={`w-full text-left p-3 hover:bg-cyan-500/10 transition-colors border-b border-cyan-500/20 last:border-0 ${
                        module._id === moduleId ? 'bg-cyan-500/20' : ''
                      }`}
                    >
                      <p className="text-white text-sm font-mono">{module.title}</p>
                      <p className="text-xs text-cyan-400/50 font-mono mt-1">
                        {module.lessons.length} aulas
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm border border-cyan-500/30 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-cyan-500/20">
                <h3 className="text-xs font-mono text-cyan-400/50 tracking-wider">
                  CONTEÚDO DO MÓDULO
                </h3>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {lessons.map((item, index) => (
                  <Link
                    key={item._id}
                    to={`/member/modulo/${moduleId}/aula/${item._id}`}
                    className={`block p-3 border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-all ${
                      item._id === lesson._id ? 'bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border-l-4 border-l-cyan-400' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black/60 border border-cyan-500/30 flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {getMediaIcon(item.mediaType)}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <FaPlay className="text-white text-xs" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-mono mb-1 ${
                          item._id === lesson._id ? 'text-cyan-400' : 'text-gray-400'
                        }`}>
                          AULA {String(index + 1).padStart(2, '0')}
                        </p>
                        <p className={`text-sm truncate ${
                          item._id === lesson._id ? 'text-white' : 'text-gray-300'
                        }`}>
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-mono text-gray-500">
                            {item.duration || "04:01"}
                          </span>
                          {index < currentIndex && (
                            <FiCheckCircle className="text-green-500" size={12} />
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-cyan-400/50">PROGRESSO</span>
                <span className="text-xs font-mono text-fuchsia-400">
                  {Math.round(((currentIndex + (isCompleted ? 1 : 0)) / lessons.length) * 100)}%
                </span>
              </div>
              
              <div className="relative h-2 bg-black/60 rounded-full overflow-hidden mb-3">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-full transition-all duration-500"
                  style={{ width: `${((currentIndex + (isCompleted ? 1 : 0)) / lessons.length) * 100}%` }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shimmer"></div>
              </div>
              
              <p className="text-xs font-mono text-gray-500">
                {currentIndex + (isCompleted ? 1 : 0)} de {lessons.length} aulas concluídas
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
          background-size: 200% auto;
        }
        
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(6, 182, 212, 0.1);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #d946ef);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #c026d3);
        }
      `}</style>
    </div>
  );
}