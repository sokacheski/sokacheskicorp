import { useState, useMemo } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import type { AuthView } from "../../pages/auth";
import { api } from "../../services/api";

export default function Register({
  onChangeView,
}: {
  onChangeView: (view: AuthView) => void;
}) {
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =======================
     EMAIL (GMAIL ONLY)
     ======================= */
  const fullEmail = email ? `${email}@gmail.com` : "";

  /* =======================
     PASSWORD STRENGTH
     ======================= */
  const strength = useMemo(() => {
    let score = 0;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const validLength = password.length >= 8 && password.length <= 12;
  const canCreateAccount =
    strength >= 3 &&
    validLength &&
    password === confirmPassword &&
    user.length >= 3 &&
    email.length > 0;

  /* =======================
     REGISTER HANDLER (REAL)
     ======================= */
  async function handleRegister() {
    if (!canCreateAccount) {
      alert("Verifique os dados antes de continuar");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/register", {
        name: user,
        email: fullEmail,
        password,
        phone: "", // pode evoluir depois
      });

      const { token, user: createdUser } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(createdUser));

      alert(`Conta criada com sucesso! Bem-vindo ${createdUser.name}`);
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex flex-col gap-5">

      {/* FRASE */}
      <p className="text-sm text-white/75 text-center leading-relaxed">
        Junte-se a nós e obtenha mais benefícios. Manteremos seus dados em segurança.
      </p>

      {/* USER */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/70">Username</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="insert username"
            className="w-full h-11 pl-10 rounded-lg bg-white/5 border border-white/10 text-sm outline-none"
          />
        </div>
      </div>

      {/* EMAIL */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/70">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
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
      </div>

      {/* PASSWORD */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-white/70">Password</label>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="insert password"
            className="w-full h-11 pl-10 pr-20 rounded-lg bg-white/5 border border-white/10 text-sm outline-none"
          />

          {password && (
            <X
              onClick={() => setPassword("")}
              className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 cursor-pointer hover:text-red-400 transition"
            />
          )}

          {showPassword ? (
            <Eye
              onClick={() => setShowPassword(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 cursor-pointer"
            />
          ) : (
            <EyeOff
              onClick={() => setShowPassword(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 cursor-pointer"
            />
          )}
        </div>

        {password && (
          <>
            <div className="flex gap-1">
              <div className={`h-1 flex-1 rounded ${strength >= 1 ? "bg-red-500" : "bg-white/10"}`} />
              <div className={`h-1 flex-1 rounded ${strength >= 2 ? "bg-yellow-500" : "bg-white/10"}`} />
              <div className={`h-1 flex-1 rounded ${strength >= 3 ? "bg-blue-500" : "bg-white/10"}`} />
              <div className={`h-1 flex-1 rounded ${strength >= 4 ? "bg-green-500" : "bg-white/10"}`} />
            </div>
          </>
        )}
      </div>

      {/* CONFIRM */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/70">Confirm password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="validate your password"
            className="w-full h-11 pl-10 pr-20 rounded-lg bg-white/5 border border-white/10 text-sm outline-none"
          />

          {showConfirm ? (
            <Eye
              onClick={() => setShowConfirm(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 cursor-pointer"
            />
          ) : (
            <EyeOff
              onClick={() => setShowConfirm(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 cursor-pointer"
            />
          )}
        </div>
      </div>

      {/* CREATE */}
      <button
        disabled={!canCreateAccount || loading}
        onClick={handleRegister}
        className={`h-11 rounded-lg border text-sm font-semibold tracking-wide transition ${
          canCreateAccount
            ? "bg-[#020617] border-white/20 text-white"
            : "bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
        }`}
      >
        {loading ? "Criando conta..." : "Create account"}
      </button>

      {/* BACK */}
      <button
        onClick={() => onChangeView("login")}
        className="h-11 rounded-lg border border-white/30 text-sm font-semibold tracking-wide text-white/80 hover:border-white/60 transition"
      >
        Voltar ao login
      </button>
    </div>
  );
}
