import { useState, useMemo } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import type { AuthView } from "../../pages/auth";
import { api } from "../../services/api";

export default function Password({
  onChangeView,
}: {
  onChangeView: (view: AuthView) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ======================
     PASSWORD RULES
  ====================== */
  const strength = useMemo(() => {
    let score = 0;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const validLength = password.length >= 8 && password.length <= 12;
  const canReset = strength >= 3 && validLength && password === confirmPassword;

  /* ======================
     SEND CODE
  ====================== */
  async function handleSendCode() {
    if (!email) {
      alert("Informe seu email");
      return;
    }

    try {
      await api.post("/auth/forgot-password", { email });
      setStep(2);
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao enviar código");
    }
  }

  /* ======================
     RESET PASSWORD
  ====================== */
  async function handleResetPassword() {
    if (!canReset) {
      alert("Senha inválida");
      return;
    }

    try {
      await api.post("/auth/reset-password", {
        email,
        code,
        password,
      });

      alert("Senha redefinida com sucesso");
      onChangeView("login");
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao redefinir senha");
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* FRASE TOPO */}
      <p className="text-sm text-white/75 text-center leading-relaxed">
        Informe seu email cadastrado. Enviaremos instruções seguras para
        redefinir sua senha.
      </p>

      {/* STEP 1 — EMAIL */}
      {step === 1 && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/70">Email</label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="insert email"
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSendCode}
            className="h-11 rounded-lg bg-[#020617] border border-white/15 text-sm font-semibold tracking-wide text-white"
          >
            Send instructions
          </button>
        </>
      )}

      {/* STEP 2 — RESET */}
      {step === 2 && (
        <>
          {/* CODE */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/70">Verification code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6 digit code"
              className="w-full h-11 px-4 rounded-lg bg-white/5 border border-white/10 text-sm outline-none"
            />
          </div>

          {/* PASSWORD */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/70">New password</label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-lg bg-white/5 border border-white/10 text-sm outline-none"
              />
              {showPassword ? (
                <Eye
                  onClick={() => setShowPassword(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 cursor-pointer text-white/60"
                />
              ) : (
                <EyeOff
                  onClick={() => setShowPassword(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 cursor-pointer text-white/60"
                />
              )}
            </div>

            {/* FRASE (IGUAL REGISTRO) */}
            {password && (
              <p className="text-[11px] text-red-400">
                A senha deve conter entre 8 e 12 caracteres, incluindo letra
                maiúscula, minúscula, número e símbolo.
              </p>
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
                className="w-full h-11 pl-10 pr-10 rounded-lg bg-white/5 border border-white/10 text-sm outline-none"
              />
              {showConfirm ? (
                <Eye
                  onClick={() => setShowConfirm(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 cursor-pointer text-white/60"
                />
              ) : (
                <EyeOff
                  onClick={() => setShowConfirm(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 cursor-pointer text-white/60"
                />
              )}
            </div>
          </div>

          <button
            onClick={handleResetPassword}
            disabled={!canReset}
            className={`h-11 rounded-lg border text-sm font-semibold tracking-wide ${
              canReset
                ? "bg-[#020617] border-white/20 text-white"
                : "bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
            }`}
          >
            Reset password
          </button>
        </>
      )}

      {/* DIVISOR */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/40">ou</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* VOLTAR */}
      <button
        onClick={() => onChangeView("login")}
        className="h-11 rounded-lg border border-white/20 text-sm font-semibold tracking-wide text-white/80"
      >
        Voltar ao login
      </button>
    </div>
  );
}
