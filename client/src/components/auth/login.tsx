import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  X,
  AlertTriangle,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import type { AuthView } from "../../pages/auth";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function Login({
  onChangeView,
}: {
  onChangeView: (view: AuthView) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const navigate = useNavigate();

  /* =======================
     EMAIL LOGIC (GMAIL ONLY)
     ======================= */

  const fullEmail = email ? `${email}@gmail.com` : "";

  const invalidEmail =
    email.length > 0 && !/^[a-zA-Z0-9._-]+$/.test(email);

  /* =======================
     LOGIN HANDLER (REAL API)
     ======================= */

  async function handleLogin() {
    if (!email || !password || invalidEmail) {
      alert("Preencha os dados corretamente");
      return;
    }

    try {
      const response = await api.post("/auth/login", {
        email: fullEmail,
        password,
      });

      const { token, user } = response.data;

      if (remember) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      // ✅ REDIRECT CORRETO (SEM /WELCOME)
       setTimeout(() => {
        if (user.role === "admin") {
          navigate("/dashboard", { replace: true });
        } else {
        navigate("/member", { replace: true });
       }
      }, 0);;
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao efetuar login");
    }
  }

  return (
    <div className="w-full flex flex-col gap-5">

      {/* EVENTO */}
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold tracking-wide text-white">
          Evento 7•171 — 31/03/2026.
        </p>
        <p className="text-[11px] uppercase tracking-widest text-white/50">
          By Sokacheski Corporation
        </p>
      </div>

      {/* EMAIL */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/70">Email</label>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />

          <input
            value={email}
            onChange={(e) =>
              setEmail(e.target.value.replace("@gmail.com", ""))
            }
            placeholder="insert email"
            className="w-full h-11 pl-10 pr-24 rounded-lg bg-white/5 border border-white/10 text-sm outline-none"
          />

          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">
            @gmail.com
          </span>
        </div>

        {invalidEmail && (
          <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
            <AlertTriangle className="w-3 h-3" />
            Insira o email de forma correta
          </div>
        )}
      </div>

      {/* PASSWORD */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/70">Password</label>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />

          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="insert password"
            className="w-full h-11 pl-10 pr-20 rounded-lg bg-white/5 border border-white/10 text-sm outline-none"
          />

          {password.length > 0 && (
            <X
              onClick={() => setPassword("")}
              className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 cursor-pointer hover:text-red-400 transition"
            />
          )}

          {showPassword ? (
            <Eye
              onClick={() => setShowPassword(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 cursor-pointer"
            />
          ) : (
            <EyeOff
              onClick={() => setShowPassword(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 cursor-pointer"
            />
          )}
        </div>
      </div>

      {/* REMEMBER */}
      <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
        <input
          type="checkbox"
          checked={remember}
          onChange={() => setRemember(!remember)}
          className="accent-blue-500"
        />
        Lembrar senha da conta
      </label>

      {/* LOGIN */}
      <button
        onClick={handleLogin}
        className="h-11 -mt-2 rounded-lg bg-[#020617] border border-white/20 text-sm font-semibold tracking-wide text-white"
      >
        Login
      </button>

      {/* LINKS */}
      <div className="flex justify-between text-xs text-white/60">
        <span className="cursor-pointer hover:text-white transition">
          Suporte ao cliente
        </span>

        <span
          onClick={() => onChangeView("password")}
          className="cursor-pointer hover:text-white transition"
        >
          Esqueceu a senha
        </span>
      </div>

      {/* DIVIDER */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/40">
          Ainda não tem uma conta?
        </span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* REGISTER */}
      <button
        onClick={() => onChangeView("register")}
        className="h-11 rounded-lg border border-white/30 text-white/80 text-sm font-semibold tracking-wide hover:border-white/60 transition"
      >
        Register
      </button>

      {/* SOCIALS */}
      <div className="flex justify-center gap-5 pt-2 text-white/50">
        <Instagram className="w-5 h-5 cursor-pointer hover:text-white transition" />
        <Twitter className="w-5 h-5 cursor-pointer hover:text-white transition" />
        <Youtube className="w-5 h-5 cursor-pointer hover:text-white transition" />
      </div>
    </div>
  );
}
