import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Search } from "lucide-react";

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
      console.log("Clicou no módulo:", moduleId); // Debug
      
      // Busca as aulas publicadas do módulo
      const response = await api.get(`/members/modules/${moduleId}/lessons`);
      console.log("Aulas encontradas:", response.data); // Debug
      
      if (response.data.length > 0) {
        // Se tiver aulas, vai para a primeira aula
        const primeiraAulaId = response.data[0]._id;
        console.log("Navegando para:", `/member/modulo/${moduleId}/aula/${primeiraAulaId}`); // Debug
        navigate(`/member/modulo/${moduleId}/aula/${primeiraAulaId}`);
      } else {
        alert("Este módulo ainda não tem aulas disponíveis.");
      }
    } catch (error) {
      console.error("Erro ao carregar aulas do módulo:", error);
      alert("Erro ao acessar o módulo. Tente novamente.");
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 1700);
    return () => clearTimeout(timer);
  }, []);

  const courseName = course?.title || "Curso";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-400 bg-black">
        Carregando curso...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 bg-black">
        {error}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* 🌌 FUNDO FUTURISTA */}
      <div className="fixed inset-0 -z-10">
        <div className="particles" />
        <div className="particles particles2" />
        <div className="particles particles3" />
        <div className="nebula" />
      </div>

      {/* 🔥 TOPBAR */}
      <header className="fixed top-0 left-0 w-full z-40 backdrop-blur-md bg-black/40 border-b border-blue-900 shadow-[0_0_30px_rgba(59,130,246,0.4)]">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div
              className="text-xl font-bold tracking-widest text-blue-400"
              style={{ textShadow: "0 0 15px #3b82f6" }}
            >
              MYPLATFORM
            </div>

            <nav className="hidden md:flex gap-6 text-sm">
              {["Início", "Comunidade", "Ranking", "Aulas Recentes"].map(
                (item) => (
                  <button
                    key={item}
                    className="relative text-blue-200 hover:text-white transition group"
                  >
                    {item}
                    <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-400 transition-all duration-300 group-hover:w-full shadow-[0_0_8px_#3b82f6]" />
                  </button>
                )
              )}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-blue-300 hover:text-white transition">
              <Search size={20} />
            </button>

            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] shadow-[0_0_12px_rgba(59,130,246,0.8)]">
              <div className="w-full h-full rounded-full bg-black" />
            </div>
          </div>
        </div>
      </header>

      {/* 🚀 OVERLAY DE INTRODUÇÃO */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div
            className="text-center animate-intro text-4xl md:text-6xl font-bold tracking-wide"
            style={{
              textShadow:
                "0 0 20px #3b82f6, 0 0 40px #3b82f6, 0 0 80px #3b82f6",
            }}
          >
            {courseName}
          </div>
        </div>
      )}

      {/* 📚 CONTEÚDO - MÓDULOS DO CURSO */}
      <div className="pt-28 pl-6 pr-4 pb-16 space-y-14">
        {sections.map((section) => {
          const modules = section.items || section.modules || [];

          return (
            <div key={section._id} className="space-y-6">
              <h2
                className="text-2xl md:text-3xl font-semibold text-blue-100"
                style={{ textShadow: "0 0 12px rgba(59,130,246,0.8)" }}
              >
                {section.title}
              </h2>

              <div
                className={
                  section.layout === "horizontal"
                    ? "flex gap-6 overflow-x-auto pb-4"
                    : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                }
              >
                {modules.map((module) => (
                  <div
                    key={module._id}
                    onClick={() => handleModuleClick(module._id)}
                    className={`group relative bg-[#0a0a0f] border border-blue-900/40 rounded-xl overflow-hidden cursor-pointer transition duration-500 hover:scale-[1.05] hover:border-blue-400 ${
                      section.layout === "vertical"
                        ? "w-full"
                        : "min-w-[260px]"
                    }`}
                  >
                    {module.image && (
                      <div className="relative overflow-hidden">
                        <img
                          src={module.image}
                          alt={module.title}
                          className={`object-cover w-full transition duration-700 group-hover:scale-110 ${
                            section.layout === "vertical"
                              ? "h-72"
                              : "h-44"
                          }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-70" />
                      </div>
                    )}

                    <div className="p-5">
                      <div className="font-medium text-lg text-blue-100 group-hover:text-white transition">
                        {module.title}
                      </div>
                    </div>

                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-[0_0_60px_rgba(59,130,246,0.6)]" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes introAnim {
          0% { opacity: 0; transform: translateY(40px) scale(0.95); }
          30% { opacity: 1; transform: translateY(0) scale(1); }
          70% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-60px) scale(1.05); }
        }
        .animate-intro {
          animation: introAnim 1.7s ease forwards;
        }

        .particles {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          box-shadow:
            100px 200px white,
            300px 400px white,
            500px 100px white,
            700px 600px white,
            900px 300px white,
            1200px 500px white,
            1500px 200px white,
            1700px 700px white;
          animation: moveParticles 60s linear infinite;
          opacity: 0.6;
        }

        .particles2 {
          animation-duration: 90s;
          opacity: 0.4;
        }

        .particles3 {
          animation-duration: 120s;
          opacity: 0.2;
        }

        @keyframes moveParticles {
          from { transform: translateY(0); }
          to { transform: translateY(-2000px); }
        }

        .nebula {
          position: absolute;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(59,130,246,0.25), transparent 70%);
          top: -200px;
          left: -200px;
          filter: blur(120px);
          animation: nebulaMove 25s ease-in-out infinite alternate;
        }

        @keyframes nebulaMove {
          from { transform: translate(0,0); }
          to { transform: translate(200px,150px); }
        }
      `}</style>
    </div>
  );
}